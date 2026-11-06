const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('super_admin', 'admin'), ctrl.getPayments);
router.post('/', authorize('super_admin', 'admin'), ctrl.recordPayment);

module.exports = router;
