const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/:hostelId/current', ctrl.getCurrentMenu);
router.get('/:hostelId', ctrl.getMenuHistory);
router.post('/', authorize('super_admin', 'admin', 'warden'), ctrl.createMenu);
router.put('/:id', authorize('super_admin', 'admin', 'warden'), ctrl.updateMenu);

module.exports = router;
