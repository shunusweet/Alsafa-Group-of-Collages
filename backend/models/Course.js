
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Course = sequelize.define(
    "Course",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        courseName: {
            type: DataTypes.STRING(150),
            allowNull: false,
            field: "course_name",
        },

        courseDuration: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "course_duration",
        },

        courseSession: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "course_session",
        },

        courseImage: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "course_image",
        },

        courseDescription: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "course_description",
        },
    },
    {
        tableName: "courses",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Course;
