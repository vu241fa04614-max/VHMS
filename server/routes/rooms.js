const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getRooms);
router.get('/:id', ctrl.getRoom);
router.post('/', authorize('super_admin', 'admin'), ctrl.createRoom);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.updateRoom);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.deleteRoom);

module.exports = router;
