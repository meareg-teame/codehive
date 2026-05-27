import { DataTypes } from 'sequelize';
import { randomUUID } from 'node:crypto';
import { sequelize } from '../config/db.js';

const Account = sequelize.define('Account', {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => randomUUID(),
  },
  email: {
    type: DataTypes.STRING,
    defaultValue: "",
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  photoUrl: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  password: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
  },
  firebaseUID: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationLinkSendingTime: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  sharedWithMe: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  accessManagementProjects: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'accounts',
});

export default Account;
