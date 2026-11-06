const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('super_admin', 'admin', 'warden'), ctrl.getStudents);
router.get('/my-profile', authorize('student'), ctrl.getMyProfile);
router.get('/:id', authorize('super_admin', 'admin', 'warden'), ctrl.getStudent);
router.post('/', authorize('super_admin', 'admin'), ctrl.createStudent);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.updateStudent);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.deleteStudent);

module.exports = router;
