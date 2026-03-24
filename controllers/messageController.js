const Message = require('../models/Message');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

// @desc    Get all messages for current user
// @route   GET /api/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find({
        $or: [
            { sender: req.user.id },
            { receiver: req.user.id }
        ]
    })
    .populate('sender', 'name role profileImage')
    .populate('receiver', 'name role profileImage')
    .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: messages.length,
        data: messages
    });
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
    const { receiver, content } = req.body;

    if (!receiver) {
        return res.status(400).json({ success: false, message: 'Please provide receiver' });
    }

    const messageData = {
        sender: req.user.id,
        receiver,
        content: content || ''
    };

    if (req.file) {
        messageData.attachment = {
            url: `/uploads/${req.file.filename}`,
            name: req.file.originalname,
            fileType: req.file.mimetype.startsWith('image/') ? 'image' : 'pdf',
            size: req.file.size
        };
    }

    if (!content && !req.file) {
        return res.status(400).json({ success: false, message: 'Please provide content or attachment' });
    }

    const message = await Message.create(messageData);

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name role profileImage')
        .populate('receiver', 'name role profileImage');

    // Emit real-time event
    const io = req.app.get('socketio');
    if (io) {
        io.to(receiver.toString()).emit('new_message', populatedMessage);
        console.log(`📤 Message emitted to user ${receiver}`);
    }

    res.status(201).json({
        success: true,
        data: populatedMessage
    });
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user.id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to mark this message as read' });
    }

    message.isRead = true;
    await message.save();

    res.json({
        success: true,
        data: message
    });
});

// @desc    Mark all messages in a conversation as read
// @route   PUT /api/messages/read/:partnerId
// @access  Private
exports.markConversationAsRead = asyncHandler(async (req, res) => {
    const { partnerId } = req.params;

    await Message.updateMany(
        { sender: partnerId, receiver: req.user.id, isRead: false },
        { isRead: true }
    );

    // Notify the partner that their messages were read
    const io = req.app.get('socketio');
    if (io) {
        io.to(partnerId.toString()).emit('messages_read', {
            readerId: req.user.id,
            partnerId: partnerId
        });
        console.log(`👁️ Read status sync emitted to user ${partnerId}`);
    }

    res.json({
        success: true,
        message: 'Conversation marked as read'
    });
});
// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Only sender can delete for everyone
    if (message.sender.toString() !== req.user.id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to delete this message' });
    }

    const { receiver } = message;
    await message.deleteOne();

    // Emit real-time event
    const io = req.app.get('socketio');
    if (io) {
        io.to(receiver.toString()).emit('message_deleted', req.params.id);
        io.to(message.sender.toString()).emit('message_deleted', req.params.id);
    }

    res.json({
        success: true,
        data: {}
    });
});

// @desc    Delete all messages in a conversation
// @route   DELETE /api/messages/conversation/:partnerId
// @access  Private
exports.deleteConversation = asyncHandler(async (req, res) => {
    const { partnerId } = req.params;

    await Message.deleteMany({
        $or: [
            { sender: req.user.id, receiver: partnerId },
            { sender: partnerId, receiver: req.user.id }
        ]
    });

    // Notify both users via socket
    const io = req.app.get('socketio');
    if (io) {
        io.to(partnerId.toString()).emit('conversation_deleted', req.user.id);
        io.to(req.user.id.toString()).emit('conversation_deleted', partnerId);
    }

    res.json({
        success: true,
        message: 'Clinical history purged successfully'
    });
});
