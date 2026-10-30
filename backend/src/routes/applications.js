const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const prisma = require('../config/prisma');
const { sendApplicationConfirmation, sendStatusUpdate } = require('../config/nodemailer');

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const where = { userId: user.id };

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, logo: true } },
          },
        },
        interviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/job/:jobId', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { jobId: req.params.jobId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, resumeUrl: true, skills: true, experience: true, education: true } },
        interviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });

    const existing = await prisma.application.findUnique({
      where: { userId_jobId: { userId: user.id, jobId } },
    });

    if (existing) return res.status(400).json({ error: 'You have already applied for this job' });

    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'ACTIVE') return res.status(400).json({ error: 'This job is no longer accepting applications' });

    const application = await prisma.application.create({
      data: { coverLetter, resumeUrl, userId: user.id, jobId },
    });

    await prisma.job.update({ where: { id: jobId }, data: { applicationCount: { increment: 1 } } });

    const io = req.app.get('io');
    io.to(`user:${user.id}`).emit('notification', {
      type: 'APPLICATION_SUBMITTED',
      title: 'Application Submitted',
      message: `Your application for ${job.title} at ${job.company.name} has been submitted.`,
    });

    await prisma.notification.create({
      data: { type: 'APPLICATION_SUBMITTED', title: 'Application Submitted', message: `Your application for ${job.title} at ${job.company.name} has been submitted.`, userId: user.id },
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { user: true, job: { include: { company: true } } },
    });

    if (!application) return res.status(404).json({ error: 'Application not found' });

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
    });

    const io = req.app.get('io');
    io.to(`user:${application.userId}`).emit('notification', {
      type: status,
      title: `Application ${status.charAt(0) + status.slice(1).toLowerCase()}`,
      message: `Your application for ${application.job.title} at ${application.job.company.name} has been ${status.toLowerCase()}.`,
    });

    await prisma.notification.create({
      data: { type: status, title: `Application ${status.charAt(0) + status.slice(1).toLowerCase()}`, message: `Your application has been ${status.toLowerCase()}.`, userId: application.userId },
    });

    const notificationTypes = { SHORTLISTED: 'Shortlisted', REJECTED: 'Rejected', OFFERED: 'Offer Letter' };
    if (notificationTypes[status]) {
      await sendStatusUpdate(application.user.email, `${application.user.firstName} ${application.user.lastName}`, application.job.title, application.job.company.name, status);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const stats = await prisma.application.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: true,
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
