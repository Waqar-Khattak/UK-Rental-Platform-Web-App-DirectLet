// Message Repository - Database Access Layer (Repository Pattern)
// Phase 3: Real-time messaging

const Message = require('../models/Message');

class MessageRepository {
  async findConversation(userId1, userId2) {
    return await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ createdAt: 1 });
  }

  async findByUser(userId) {
    return await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });
  }

  async countUnreadForConversation(otherUserId, currentUserId) {
    return await Message.countDocuments({
      senderId: otherUserId,
      receiverId: currentUserId,
      isRead: false,
    });
  }

  async countByUser(userId) {
    return await Message.countDocuments({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
  }

  async countByPropertyIds(propertyIds) {
    return await Message.countDocuments({ propertyId: { $in: propertyIds } });
  }

  async countByPropertyId(propertyId) {
    return await Message.countDocuments({ propertyId });
  }

  async create(messageData) {
    const message = new Message(messageData);
    return await message.save();
  }

  async markAsRead(messageId) {
    return await Message.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
  }

  async deleteMessage(messageId) {
    return await Message.findByIdAndDelete(messageId);
  }
}

module.exports = new MessageRepository();
