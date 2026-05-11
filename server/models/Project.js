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

module.exports = {
  createProject,
  getPaginatedProjectsForUser,
};
