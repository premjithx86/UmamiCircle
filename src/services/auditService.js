const AuditLog = require("../models/AuditLog");

/**
 * Log an administrative action
 * @param {string} adminId - The ID of the admin performing the action
 * @param {string} action - The action type (e.g., 'DELETE_POST', 'BLOCK_USER')
 * @param {string} [targetType] - The type of target (e.g., 'Post', 'User')
 * @param {string} [targetId] - The ID of the target
 * @param {Object} [details] - Additional JSON details about the action
 * @param {string} [ipAddress] - The IP address of the admin
 */
const logAction = async ({ adminId, action, targetType, targetId, details, ipAddress }) => {
  try {
    const log = new AuditLog({
      admin: adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
    });
    await log.save();
    return log;
  } catch (error) {
    console.error("Error creating audit log:", error);
    // We don't throw here to prevent admin actions from failing if logging fails
  }
};

module.exports = {
  logAction,
};
