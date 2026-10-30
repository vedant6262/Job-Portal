const express = require('express');
const router = express.Router();
const { requireAuth, clerkClient } = require('../middleware/auth');
const prisma = require('../config/prisma');

router.get('/me', requireAuth, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: req.userId },
      include: {
        skills: true,
        education: { orderBy: { startDate: 'desc' } },
        experience: { orderBy: { startDate: 'desc' } },
        projects: true,
        certificates: true,
        company: true,
        _count: {
          select: {
            applications: true,
            savedJobs: true,
            notifications: { where: { read: false } },
          },
        },
      },
    });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(req.userId);
      user = await prisma.user.create({
        data: {
          clerkId: req.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          avatarUrl: clerkUser.imageUrl,
          role: clerkUser.publicMetadata?.role || 'CANDIDATE',
        },
        include: {
          skills: true,
          education: true,
          experience: true,
          projects: true,
          certificates: true,
          company: true,
        },
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, phone, location, headline, bio } = req.body;
    const user = await prisma.user.update({
      where: { clerkId: req.userId },
      data: { firstName, lastName, phone, location, headline, bio, isOnboarded: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/skills', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const skill = await prisma.skill.create({
      data: { name, userId: user.id },
    });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/skills/:id', requireAuth, async (req, res) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.json({ message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/education', requireAuth, async (req, res) => {
  try {
    const { school, degree, field, startDate, endDate, grade, description } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const education = await prisma.education.create({
      data: { school, degree, field, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, grade, description, userId: user.id },
    });
    res.json(education);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/experience', requireAuth, async (req, res) => {
  try {
    const { company, title, location, startDate, endDate, current, description } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const experience = await prisma.experience.create({
      data: { company, title, location, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, current, description, userId: user.id },
    });
    res.json(experience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects', requireAuth, async (req, res) => {
  try {
    const { name, description, url, technologies } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const project = await prisma.project.create({
      data: { name, description, url, technologies, userId: user.id },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/certificates', requireAuth, async (req, res) => {
  try {
    const { name, issuer, url, issueDate, expiryDate } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const certificate = await prisma.certificate.create({
      data: { name, issuer, url, issueDate: new Date(issueDate), expiryDate: expiryDate ? new Date(expiryDate) : null, userId: user.id },
    });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resume', requireAuth, async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    const user = await prisma.user.update({
      where: { clerkId: req.userId },
      data: { resumeUrl },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
