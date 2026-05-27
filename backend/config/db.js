import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const connectPostgres = async ({ sync } = {}) => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');

    const shouldSync =
      typeof sync === 'boolean'
        ? sync
        : process.env.NODE_ENV !== 'production' && process.env.SEQUELIZE_SYNC !== 'false';

    if (shouldSync) {
      await sequelize.sync();
      console.log('Sequelize models synchronized.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default connectPostgres;
export { sequelize };
