const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getComplaints);
router.get('/my-complaints', authorize('student'), ctrl.getMyComplaints);
router.post('/', authorize('student'), ctrl.submitComplaint);
router.put('/:id/status', authorize('super_admin', 'admin', 'warden'), ctrl.updateComplaintStatus);
router.put('/:id/feedback', authorize('student'), ctrl.submitFeedback);

module.exports = router;
