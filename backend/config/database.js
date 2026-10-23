const { Sequelize } = require("sequelize");
require("dotenv").config();

// =====================================
// CREATE SEQUELIZE INSTANCE
// =====================================

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        logging: false
    }
);

// =====================================
// DATABASE CONNECTION
// =====================================

const connectDB = async () => {
    try {
        await sequelize.authenticate();

        console.log("MySQL Database Connected Successfully!");
    } catch (error) {
        console.error("Database Connection Failed:");
        console.error(error.message);

        throw error;
    }
};

// =====================================
// EXPORT
// =====================================

module.exports = {
    sequelize,
    connectDB
};