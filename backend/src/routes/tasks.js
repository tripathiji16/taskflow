const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireProjectAccess } = require('../middleware/rbac');
const { createTask, getTasks, getTask, updateTask, deleteTask, getDashboard } = require('../controllers/taskController');

router.use(authenticate);

router.get('/dashboard', getDashboard);

router.post('/', createTask);

router.get('/project/:projectId', requireProjectAccess, getTasks);
router.get('/project/:projectId/:taskId', requireProjectAccess, getTask);
router.patch('/project/:projectId/:taskId', requireProjectAccess, updateTask);
router.delete('/project/:projectId/:taskId', requireProjectAccess, deleteTask);

module.exports = router;
