const Notification = require("../models/Notification");
let io;

/**
 * Initialize Socket.io
 * @param {object} ioInstance - The socket.io instance
 */
const initSocket = (ioInstance) => {
  io = ioInstance;
  
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join a room based on user ID for targeted notifications
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

/**
 * Create and emit a notification
 * @param {object} data - Notification data (user, actor, type, targetType, targetId)
 */
const createNotification = async ({ user, actor, type, targetType, targetId }) => {
  try {
    // Don't notify if user is the same as actor (e.g., liking own post)
    if (user.toString() === actor.toString()) return null;

    const notification = new Notification({
      user,
      actor,
      type,
      targetType,
      targetId,
    });

    await notification.save();

    // Populate actor info for the frontend
    const populatedNotification = await Notification.findById(notification._id)
      .populate("actor", "username avatar");

    // Emit to the specific user's room
    if (io) {
      io.to(user.toString()).emit("new_notification", populatedNotification);
    }

    return populatedNotification;
  } catch (error) {
    console.error("Error creating/emitting notification:", error);
  }
};

module.exports = {
  initSocket,
  createNotification,
};
