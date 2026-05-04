const { Op } = require('sequelize');
const { Project, ProjectMember, User, Task } = require('../models');

const createProject = async (req, res, next) => {
  try {
    const { name, description, color, dueDate } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const project = await Project.create({
      name, description, color, dueDate,
      ownerId: req.user.id
    });

    // Auto-add creator as admin member
    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      role: 'admin'
    });

    const full = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['role'] } }
      ]
    });

    res.status(201).json({ project: full });
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const memberships = await ProjectMember.findAll({ where: { user_id: req.user.id } });
    const projectIds = memberships.map(m => m.projectId);

    const projects = await Project.findAll({
      where: { id: { [Op.in]: projectIds } },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['role'] } },
        { model: Task, as: 'tasks', attributes: ['id', 'status'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['role'] } },
        {
          model: Task, as: 'tasks',
          include: [
            { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { name, description, color, dueDate, status } = req.body;
    await project.update({ name, description, color, dueDate, status });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Only the owner can delete this project' });
    }
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await ProjectMember.findOne({
      where: { project_id: req.params.id, user_id: user.id }
    });
    if (existing) return res.status(409).json({ error: 'User is already a member' });

    const member = await ProjectMember.create({
      projectId: req.params.id,
      userId: user.id,
      role
    });

    res.status(201).json({ member, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const membership = await ProjectMember.findOne({
      where: { project_id: req.params.id, user_id: userId }
    });
    if (!membership) return res.status(404).json({ error: 'Member not found' });

    await membership.update({ role });
    res.json({ membership });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const membership = await ProjectMember.findOne({
      where: { project_id: req.params.id, user_id: userId }
    });
    if (!membership) return res.status(404).json({ error: 'Member not found' });

    await membership.destroy();
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember, updateMember, removeMember };
