const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const prisma = require('../config/prisma');

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
