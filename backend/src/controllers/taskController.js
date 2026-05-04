const { Op } = require('sequelize');
const { Task, User, Project, ProjectMember } = require('../models');

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId, projectId } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    // Verify assignee is a project member if provided
    if (assigneeId) {
      const isMember = await ProjectMember.findOne({ where: { project_id: projectId, user_id: assigneeId } });
      if (!isMember) return res.status(400).json({ error: 'Assignee must be a project member' });
    }

    const task = await Task.create({
      title, description, status, priority, dueDate, assigneeId,
      projectId,
      creatorId: req.user.id
    });

    const full = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'color'] }
      ]
    });

    res.status(201).json({ task: full });
  } catch (err) {
    next(err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId } = req.query;

    const where = { project_id: projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assignee_id = assigneeId;

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.taskId, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'color'] }
      ]
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    await task.update({ title, description, status, priority, dueDate, assigneeId });

    const full = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({ task: full });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Only creator or project admin can delete
    if (task.creatorId !== req.user.id && req.memberRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const memberships = await ProjectMember.findAll({ where: { user_id: userId } });
    const projectIds = memberships.map(m => m.projectId);

    const [myTasks, overdueTasks, projectStats] = await Promise.all([
      Task.findAll({
        where: {
          assignee_id: userId,
          status: { [Op.ne]: 'done' }
        },
        include: [
          { model: Project, as: 'project', attributes: ['id', 'name', 'color'] }
        ],
        order: [['dueDate', 'ASC']],
        limit: 10
      }),
      Task.findAll({
        where: {
          project_id: { [Op.in]: projectIds },
          status: { [Op.ne]: 'done' },
          due_date: { [Op.lt]: today }
        },
        include: [
          { model: Project, as: 'project', attributes: ['id', 'name', 'color'] },
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
        ],
        limit: 10
      }),
      Project.findAll({
        where: { id: { [Op.in]: projectIds } },
        include: [{ model: Task, as: 'tasks', attributes: ['id', 'status'] }]
      })
    ]);

    const stats = {
      totalProjects: projectStats.length,
      totalTasks: projectStats.reduce((acc, p) => acc + p.tasks.length, 0),
      completedTasks: projectStats.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'done').length, 0),
      overdueTasks: overdueTasks.length,
      myPendingTasks: myTasks.length
    };

    res.json({ stats, myTasks, overdueTasks });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getDashboard };
