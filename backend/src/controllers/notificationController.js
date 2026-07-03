import Notification from "../models/Notification.js";

export async function getMyNotifications(req, res) {
  try {
    const notifications = await Notification.find({
      recipientId: req.user._id,
    })
      .populate("senderId", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => n.status === "unread").length;

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error in getMyNotifications Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user._id },
      { status: "read" },
      { new: true },
    );

    if (!notification)
      return res.status(404).json({ msg: "Notification not found" });

    res.status(200).json({ notification });
  } catch (error) {
    console.error("Error in markAsRead Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function markAllAsRead(req, res) {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, status: "unread" },
      { status: "read" },
    );

    res.status(200).json({ msg: "All notifications marked as read" });
  } catch (error) {
    console.error("Error in markAllAsRead Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientId: req.user._id,
    });

    if (!notification)
      return res.status(404).json({ msg: "Notification not found" });

    res.status(200).json({ msg: "Notification deleted" });
  } catch (error) {
    console.error("Error in deleteNotification Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}
