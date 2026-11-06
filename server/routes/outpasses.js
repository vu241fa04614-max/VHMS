const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/outpassController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getOutpasses);
router.get('/my-outpasses', authorize('student'), ctrl.getMyOutpasses);
router.post('/', authorize('student'), ctrl.applyOutpass);
router.put('/:id/review', authorize('super_admin', 'admin', 'warden'), ctrl.reviewOutpass);
router.put('/:id/return', authorize('super_admin', 'admin', 'warden'), ctrl.markReturn);
router.delete('/:id', authorize('student'), ctrl.cancelOutpass);

module.exports = router;
