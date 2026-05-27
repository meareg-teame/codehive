import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
  firebaseUID: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING
  },
  photoURL: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'guest'),
    defaultValue: 'user'
  },
  lastActiveAt: {
    type: DataTypes.DATE
  }
});

export default User;
