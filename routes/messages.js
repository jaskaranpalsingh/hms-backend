const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, markAsRead, markConversationAsRead, deleteMessage, deleteConversation } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
    .get(getMessages)
    .post(upload.single('attachment'), sendMessage);

router.put('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);
router.delete('/conversation/:partnerId', deleteConversation);
router.put('/read/:partnerId', markConversationAsRead);

module.exports = router;
