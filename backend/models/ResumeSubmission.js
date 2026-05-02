const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ResumeSubmission = sequelize.define(
  "ResumeSubmission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    candidateName: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true,
    },
    email: {
      type: DataTypes.STRING,
      lowercase: true,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    missingSkills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    weakSections: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    formattingTips: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    verdict: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    jobDescription: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    resumeText: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    fileType: {
      type: DataTypes.ENUM("txt", "pdf"),
      defaultValue: "txt",
    },
    feedback: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ["createdAt"],
        name: "idx_createdAt",
      },
      {
        fields: ["score"],
        name: "idx_score",
      },
    ],
  }
);

module.exports = ResumeSubmission;
