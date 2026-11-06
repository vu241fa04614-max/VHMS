const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('super_admin', 'admin', 'warden'), ctrl.getFees);
router.get('/my-fees', authorize('student'), ctrl.getMyFees);
router.post('/', authorize('super_admin', 'admin'), ctrl.createFee);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.updateFee);

module.exports = router;
