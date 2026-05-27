import { DataTypes } from 'sequelize';
import { randomUUID } from 'node:crypto';
import { sequelize } from '../config/db.js';

const Session = sequelize.define('Session', {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => randomUUID(),
  },
  projectId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  roomCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  state: {
    type: DataTypes.ENUM("Initialized", "Waiting", "Active", "Synchronizing", "Terminated"),
    defaultValue: "Initialized"
  },
  participants: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  linesWritten: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  executionsRun: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  startedAt: {
    type: DataTypes.DATE
  },
  endedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'sessions',
});

export default Session;
