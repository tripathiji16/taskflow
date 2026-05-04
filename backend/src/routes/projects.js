const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireProjectAccess, requireProjectAdmin } = require('../middleware/rbac');
const {
  createProject, getProjects, getProject,
  updateProject, deleteProject,
  addMember, updateMember, removeMember
} = require('../controllers/projectController');

router.use(authenticate);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', requireProjectAccess, getProject);
router.patch('/:id', requireProjectAdmin, updateProject);
router.delete('/:id', deleteProject);

// Member management (admin only)
router.post('/:id/members', requireProjectAdmin, addMember);
router.patch('/:id/members/:userId', requireProjectAdmin, updateMember);
router.delete('/:id/members/:userId', requireProjectAdmin, removeMember);

module.exports = router;
