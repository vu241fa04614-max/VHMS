const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hostelController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getHostels);
router.get('/:id', ctrl.getHostel);
router.post('/', authorize('super_admin', 'admin'), ctrl.createHostel);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.updateHostel);
router.delete('/:id', authorize('super_admin'), ctrl.deleteHostel);

module.exports = router;
