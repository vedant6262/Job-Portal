const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validateReview } = require('../middleware/validate');
const prisma = require('../config/prisma');

router.get('/company/:companyId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { companyId: req.params.companyId },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await prisma.review.aggregate({
      where: { companyId: req.params.companyId },
      _avg: { rating: true },
      _count: true,
    });

    res.json({ reviews, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, validateReview, async (req, res) => {
  try {
    const { companyId, rating, title, comment } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });

    const existing = await prisma.review.findUnique({
      where: { companyId_userId: { companyId, userId: user.id } },
    });

    if (existing) return res.status(400).json({ error: 'You have already reviewed this company' });

    const review = await prisma.review.create({
      data: { companyId, rating, title, comment, userId: user.id },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    if (review.userId !== user.id) return res.status(403).json({ error: 'Not authorized' });

    const { rating, title, comment } = req.body;
    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { rating, title, comment },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    if (review.userId !== user.id && user.role !== 'ADMIN') return res.status(403).json({ error: 'Not authorized' });

    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
