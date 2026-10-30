const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const prisma = require('../config/prisma');

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: user.id },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, logo: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(savedJobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });

    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: user.id, jobId } },
    });

    if (existing) {
      await prisma.savedJob.delete({ where: { id: existing.id } });
      return res.json({ message: 'Job unsaved', saved: false });
    }

    await prisma.savedJob.create({
      data: { userId: user.id, jobId },
    });

    res.json({ message: 'Job saved', saved: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:jobId', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const saved = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: user.id, jobId: req.params.jobId } },
    });

    if (!saved) return res.status(404).json({ error: 'Saved job not found' });

    await prisma.savedJob.delete({ where: { id: saved.id } });
    res.json({ message: 'Job unsaved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
