let io;

/**
 * Initialize Messaging Socket logic
 * @param {object} ioInstance - The socket.io instance
 */
const initMessagingSocket = (ioInstance) => {
  io = ioInstance;

  io.on("connection", (socket) => {
    // Join a conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation room: ${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`User left conversation room: ${conversationId}`);
    });

    // Typing indicator
    socket.on("typing", ({ conversationId, userId, username }) => {
      socket.to(conversationId).emit("user_typing", { userId, username });
    });

    socket.on("stop_typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_stopped_typing", { userId });
    });
  });
};

/**
 * Emit a new message to a conversation room
 * @param {string} conversationId 
 * @param {object} message 
 */
const emitNewMessage = (conversationId, message) => {
  if (io) {
    io.to(conversationId.toString()).emit("new_message", message);
  }
};

module.exports = {
  initMessagingSocket,
  emitNewMessage,
};
