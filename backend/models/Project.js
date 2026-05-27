import { DataTypes } from 'sequelize';
import { randomUUID } from 'node:crypto';
import { sequelize } from '../config/db.js';

const Project = sequelize.define('Project', {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => randomUUID(),
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  owner: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  visibility: {
    type: DataTypes.STRING,
    defaultValue: "public"
  },
  collaborators: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  files: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  creationTime: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  editedTime: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  accessRequests: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'projects',
});

export default Project;
