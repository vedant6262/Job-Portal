const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateInterview } = require('../middleware/validate');
const prisma = require('../config/prisma');
const { sendInterviewInvitation } = require('../config/nodemailer');

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const interviews = await prisma.interview.findMany({
      where: { userId: user.id },
      include: {
        application: {
          include: { job: { include: { company: { select: { name: true, logo: true } } } } },
        },
      },
      orderBy: { date: 'asc' },
    });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, requireRole('RECRUITER', 'ADMIN'), validateInterview, async (req, res) => {
  try {
    const { applicationId, userId, date, duration, type, location, meetingLink, notes, title } = req.body;
    const recipientId = userId || (await prisma.application.findUnique({ where: { id: applicationId } }))?.userId;

    if (!recipientId) return res.status(400).json({ error: 'Recipient not found' });

    const interview = await prisma.interview.create({
      data: {
        title, date: new Date(date), duration: parseInt(duration), type, location, meetingLink, notes,
        userId: recipientId,
        applicationId,
      },
    });

    if (applicationId) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'INTERVIEW' },
      });
    }

    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
    const application = applicationId ? await prisma.application.findUnique({ where: { id: applicationId }, include: { job: { include: { company: true } } } }) : null;

    const io = req.app.get('io');
    io.to(`user:${recipientId}`).emit('notification', {
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      message: `An interview has been scheduled for ${application?.job?.title || title}`,
    });

    await prisma.notification.create({
      data: {
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview Scheduled',
        message: `An interview has been scheduled for ${application?.job?.title || title}`,
        userId: recipientId,
      },
    });

    if (recipient?.email) {
      await sendInterviewInvitation(
        recipient.email,
        `${recipient.firstName} ${recipient.lastName}`,
        application?.job?.title || title,
        application?.job?.company?.name || '',
        new Date(date).toLocaleDateString(),
        new Date(date).toLocaleTimeString(),
        meetingLink
      );
    }

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const interview = await prisma.interview.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
