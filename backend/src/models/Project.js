const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: true, len: [1, 200] }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'on_hold', 'completed', 'archived'),
    defaultValue: 'active'
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6366f1'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'due_date'
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id'
  }
}, {
  tableName: 'projects',
  timestamps: true
});

module.exports = Project;
