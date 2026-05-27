import { DataTypes } from 'sequelize';
import { randomUUID } from 'node:crypto';
import { sequelize } from '../config/db.js';

const CodeDocument = sequelize.define('CodeDocument', {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => randomUUID(),
  },
  projectId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT
  },
  language: {
    type: DataTypes.STRING
  },
  lastEditedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'code_documents',
});

export default CodeDocument;
