import Project from "../models/Project.js";
import Session from "../models/Session.js";
import { Op } from "sequelize";

export async function getOverview(req, res) {
  try {
    const userEmail = req.user.email || req.user.user;

    // Get user's projects (both owned and collaborated)
    const userProjects = await Project.findAll({
      where: {
        [Op.or]: [
          { owner: userEmail },
          { collaborators: { [Op.contains]: [{ userId: req.user.userId }] } }
        ]
      }
    });
    const projectIds = userProjects.map((p) => p._id);
    const projectCount = userProjects.length;

    // Get sessions of user's projects
    const sessions = await Session.findAll({
      where: {
        projectId: {
          [Op.in]: projectIds,
        },
      },
    });

    const totalSessions = sessions.length;

    // Sum session durations
    let totalTimeInSessions = 0;
    sessions.forEach((s) => {
      if (s.startedAt && s.endedAt) {
        totalTimeInSessions += (new Date(s.endedAt) - new Date(s.startedAt)) / 1000;
      }
    });
    // Find most used language
    const languages = userProjects.map((p) => p.language).filter(Boolean);
    let mostUsedLanguage = "javascript";
    if (languages.length > 0) {
      const counts = {};
      languages.forEach((l) => {
        counts[l] = (counts[l] || 0) + 1;
      });
      mostUsedLanguage = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
      );
    }

    // Executions run
    const totalExecutions = sessions.reduce((acc, s) => acc + (s.executionsRun || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        totalTimeInSessions: Math.round(totalTimeInSessions),
        mostUsedLanguage: mostUsedLanguage.toUpperCase(),
        totalExecutions,
        projectCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProjectAnalytics(req, res) {
  try {
    const { projectId } = req.params;

    const sessions = await Session.findAll({ where: { projectId } });
    const totalSessions = sessions.length;

    // Compute average session duration
    let totalDuration = 0;
    let validSessionCount = 0;
    sessions.forEach((s) => {
      if (s.startedAt && s.endedAt) {
        totalDuration += (new Date(s.endedAt) - new Date(s.startedAt)) / 1000;
        validSessionCount++;
      }
    });
    const avgSessionDuration =
      validSessionCount > 0 ? Math.round(totalDuration / validSessionCount) : 0;

    const project = await Project.findByPk(projectId);
    const languageDistribution = {};
    if (project && project.language) {
      languageDistribution[project.language] = 100;
    }

    const memberContributions = [];
    if (project && Array.isArray(project.collaborators) && project.collaborators.length > 0) {
      project.collaborators.forEach((collab) => {
        memberContributions.push({
          userName: collab.userName || collab.email || "Unknown", // Assuming collaborator objects have userName or email
          linesContributed: 0, // Placeholder, needs actual implementation
        });
      });
    }

    const sessionsOverTime = [];
    const sessionCountsByDate = sessions.reduce((acc, s) => {
      if (s.startedAt) {
        const sDate = new Date(s.startedAt);
        // Format date to YYYY-MM-DD to use as map key
        const dateKey = sDate.toISOString().split('T')[0];
        acc[dateKey] = (acc[dateKey] || 0) + 1;
      }
      return acc;
    }, {});

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const dateKey = date.toISOString().split('T')[0];
      const count = sessionCountsByDate[dateKey] || 0;

      sessionsOverTime.push({
        date: dateString,
        count: count,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        avgSessionDuration,
        languageDistribution,
        memberContributions,
        sessionsOverTime,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
