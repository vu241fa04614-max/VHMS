const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blockController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getBlocks);
router.get('/:id', ctrl.getBlock);
router.post('/', authorize('super_admin', 'admin'), ctrl.createBlock);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.updateBlock);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.deleteBlock);

module.exports = router;
