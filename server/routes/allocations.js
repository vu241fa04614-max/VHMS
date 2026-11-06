const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/allocationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('super_admin', 'admin', 'warden'), ctrl.getAllocations);
router.post('/', authorize('super_admin', 'admin'), ctrl.createAllocation);
router.put('/:id/vacate', authorize('super_admin', 'admin'), ctrl.vacateAllocation);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.updateAllocation);

module.exports = router;
