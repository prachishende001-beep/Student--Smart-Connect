const Notification = require('../models/Notification');
const imagekit = require('../utils/imagekit');
const fs = require('fs');

const getNotifications = async (req, res) => {
    try {
        const { role, dept, sec } = req.user;

        let query = {};
        if (role === 'principal') {
            query = {
                $or: [
                    { recipientId: req.user.id },
                    { isBroadcast: true }
                ]
            };
        } else {
            query = {
                $or: [
                    { recipientId: req.user.id },
                    {
                        isBroadcast: true,
                        targetRoles: role,
                        $and: [
                            { $or: [{ targetDept: null }, { targetDept: "" }, { targetDept: dept }] },
                            { $or: [{ targetSection: null }, { targetSection: "" }, { targetSection: sec }] }
                        ]
                    }
                ]
            };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('senderId', 'name role');
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

const createAnnouncement = async (req, res) => {
    try {
        const { title, message, targetRoles, targetDept, targetSection } = req.body;
        const attachments = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResponse = await imagekit.upload({
                    file: fs.readFileSync(file.path),
                    fileName: file.originalname,
                    folder: '/announcements'
                });
                attachments.push({
                    url: uploadResponse.url,
                    fileType: file.mimetype,
                    name: file.originalname
                });
                fs.unlinkSync(file.path);
            }
        }

        const announcement = new Notification({
            senderId: req.user.id,
            senderRole: req.user.role,
            title,
            message,
            targetRoles: typeof targetRoles === 'string' ? JSON.parse(targetRoles) : targetRoles,
            targetDept: targetDept || null,
            targetSection: targetSection || null,
            attachments,
            isBroadcast: true
        });

        await announcement.save();
        res.status(201).json({ message: 'Announcement sent successfully', announcement });
    } catch (error) {
        res.status(500).json({ message: 'Error sending announcement', error: error.message });
    }
};

const markRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        if (notification.isBroadcast) {
            if (!notification.isReadBy.includes(req.user.id)) {
                notification.isReadBy.push(req.user.id);
                await notification.save();
            }
        } else {
            notification.isRead = true;
            await notification.save();
        }

        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

const markAllRead = async (req, res) => {
    try {
        // Individual notifications
        await Notification.updateMany(
            { recipientId: req.user.id, isRead: false },
            { isRead: true }
        );

        // Broadcasts
        let broadcastQuery = { isBroadcast: true, isReadBy: { $ne: req.user.id } };
        if (req.user.role !== 'principal') {
            broadcastQuery.targetRoles = req.user.role;
        }

        await Notification.updateMany(
            broadcastQuery,
            { $push: { isReadBy: req.user.id } }
        );

        res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

module.exports = { getNotifications, createAnnouncement, markRead, markAllRead };
