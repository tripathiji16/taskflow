const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');

// User <-> Project (owner)
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });

// Project <-> User (members via ProjectMember)
Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'project_id',
  otherKey: 'user_id',
  as: 'members'
});
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'user_id',
  otherKey: 'project_id',
  as: 'projects'
});

ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'projectMembers' });

// Task associations
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
User.hasMany(Task, { foreignKey: 'assignee_id', as: 'assignedTasks' });

module.exports = { User, Project, ProjectMember, Task };
