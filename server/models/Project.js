const projects = [];

const createProject = ({ userId, title, description, status = 'draft' }) => {
  const project = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    title,
    description,
    status,
    createdAt: new Date().toISOString(),
  };

  projects.unshift(project);

  return project;
};

const getPaginatedProjectsForUser = (userId, page = 1, limit = 5) => {
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 20) : 5;
  const userProjects = projects.filter((project) => project.userId === userId);
  const totalItems = userProjects.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit);
  const requestedPage = Number.isFinite(page) ? page : 1;
  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(requestedPage, 1), totalPages);
  const startIndex = (safePage - 1) * safeLimit;
  const items = userProjects.slice(startIndex, startIndex + safeLimit);

  return {
    items,
    pagination: {
      currentPage: safePage,
      pageSize: safeLimit,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
};

const getProjectById = (projectId) => {
  return projects.find((project) => project.id === projectId) || null;
};

const getProjectForUser = (projectId, userId) => {
  const project = getProjectById(projectId);

  if (!project || project.userId !== userId) {
    return null;
  }

  return project;
};

const updateProjectForUser = (projectId, userId, updates) => {
  const project = getProjectForUser(projectId, userId);

  if (!project) {
    return null;
  }

  project.title = updates.title;
  project.description = updates.description;
  project.status = updates.status;
  project.updatedAt = new Date().toISOString();

  return project;
};

const deleteProjectForUser = (projectId, userId) => {
  const projectIndex = projects.findIndex(
    (project) => project.id === projectId && project.userId === userId
  );

  if (projectIndex === -1) {
    return null;
  }

  const [deletedProject] = projects.splice(projectIndex, 1);
  return deletedProject;
};

module.exports = {
  createProject,
  deleteProjectForUser,
  getProjectById,
  getProjectForUser,
  getPaginatedProjectsForUser,
  updateProjectForUser,
};
