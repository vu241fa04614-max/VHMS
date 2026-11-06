const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getAnnouncements);
router.post('/', authorize('super_admin', 'admin', 'warden'), ctrl.createAnnouncement);
router.put('/:id', authorize('super_admin', 'admin', 'warden'), ctrl.updateAnnouncement);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.deleteAnnouncement);

module.exports = router;
