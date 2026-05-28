import { Sequelize } from "sequelize";

const isProduction = process.env.NODE_ENV === "production";
const shouldUseSSL =
  process.env.DATABASE_SSL === "true" ||
  (process.env.DATABASE_SSL !== "false" && isProduction);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: shouldUseSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

const connectPostgres = async ({ sync } = {}) => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');

    const envSync = process.env.SEQUELIZE_SYNC;
    const shouldSync =
      typeof sync === "boolean"
        ? sync
        : envSync !== "false";

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
