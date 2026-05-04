const { ProjectMember, Project } = require('../models');

// Check if user is admin or member of a project
const requireProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId || req.params.id;
    const userId = req.user.id;

    const membership = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: userId }
    });

    // Also check if user is the owner
    const project = await Project.findOne({
      where: { id: projectId, owner_id: userId }
    });

    if (!membership && !project) {
      return res.status(403).json({ error: 'Access denied: not a project member' });
    }

    req.projectMembership = membership;
    req.isProjectOwner = !!project;
    req.memberRole = membership ? membership.role : 'admin';
    next();
  } catch (err) {
    next(err);
  }
};

const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const userId = req.user.id;

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.ownerId === userId) {
      req.memberRole = 'admin';
      return next();
    }

    const membership = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: userId, role: 'admin' }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied: admin role required' });
    }

    req.memberRole = 'admin';
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireProjectAccess, requireProjectAdmin };
