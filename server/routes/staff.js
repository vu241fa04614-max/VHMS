const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('super_admin', 'admin'));
router.get('/', ctrl.getStaff);
router.post('/', ctrl.createStaff);
router.put('/:id', ctrl.updateStaff);
router.delete('/:id', ctrl.deleteStaff);

module.exports = router;
