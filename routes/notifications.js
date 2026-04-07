const express = require('express');
const router = express.Router();
const { getUserNotifications, createNotification, markAsRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/user/:userId', getUserNotifications);
router.post('/', createNotification);
router.put('/:id/read', markAsRead);
router.put('/user/:userId/read-all', markAllRead);

module.exports = router;
