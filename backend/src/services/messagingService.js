// Messaging Service - Business Logic Layer
// Phase 3: Real-time messaging and notifications

const messageRepository = require('../repositories/messageRepository');
const { getSocket } = require('../socket');

class MessagingService {
  async sendMessage(senderId, receiverId, content, propertyId) {
    const message = await messageRepository.create({
      senderId,
      receiverId,
      content,
      propertyId,
    });

    const socket = getSocket();
    const payload = message.toObject ? message.toObject() : message;
    socket.to(`user_${receiverId}`).emit('newMessage', payload);
    socket.to(`user_${senderId}`).emit('newMessage', payload);

    return message;
  }

  async getConversation(userId1, userId2) {
    return await messageRepository.findConversation(userId1, userId2);
  }

  async markAsRead(messageId) {
    return await messageRepository.markAsRead(messageId);
  }
}

module.exports = new MessagingService();
