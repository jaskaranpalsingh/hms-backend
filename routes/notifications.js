const express = require('express');
const router = express.Router();
const { getUserNotifications, createNotification, markAsRead } = require('../controllers/notificationController');

router.get('/user/:userId', getUserNotifications);
router.post('/', createNotification);
router.put('/:id/read', markAsRead);

module.exports = router;
