import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response || error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth
export const login = (data) => api.post("/users/login", data);
export const register = (data) => api.post("/users/register", data);

// Org Applications
export const submitOrgApplication = (data) =>
  api.post("/applications/submit", data);
export const getApplications = () => api.get("/applications");
export const getApplicationStats = () => api.get("/applications/stats");
export const approveApplication = (id) =>
  api.post(`/applications/${id}/approve`);
export const rejectApplication = (id, reason) =>
  api.post(`/applications/${id}/reject`, reason ? { reason } : {});

// Users
export const getAllUsers = () => api.get("/users");
export const changePassword = (data) => api.put("/users/change-password", data);
export const getAllAdmins = () => api.get("/users/admins");
export const getSuperAdminStats = () => api.get("/users/stats");
export const updateUserRole = (id, role) =>
  api.put(`/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const createManagedUser = (data, role) =>
  api.post(`/users/managed?role=${role}`, data);
export const deleteManagedUser = (id) => api.delete(`/users/managed/${id}`);

// Issues
export const getAllIssues = () => api.get("/issues");
export const getAllIssuesUnfiltered = () => api.get("/issues/all");
export const getAssignableIssues = () => api.get("/issues/assignable");
export const getIssueById = (id) => api.get(`/issues/${id}`);
export const createIssue = (data, files = []) => {
  const fd = new FormData();
  fd.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  files.forEach((f) => fd.append("files", f));
  return api.post("/issues", fd);
};
export const assignIssue = (data) => api.post("/issues/assign", data);
export const updateStatus = (data) => api.put("/issues/status", data);
export const filterIssues = (params) => api.get("/issues/filter", { params });

// Comments
export const addComment = (data, files = []) => {
  const fd = new FormData();
  fd.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  files.forEach((f) => fd.append("files", f));
  return api.post("/comments", fd);
};
export const getCommentsByIssue = (issueId) =>
  api.get(`/comments/issue/${issueId}`);

// Attachments
export const getIssueAttachments = (issueId) =>
  api.get(`/attachments/issue/${issueId}`);
export const getCommentAttachments = (commentId) =>
  api.get(`/attachments/comment/${commentId}`);

// Organizations
export const getOrganizations = () => api.get("/organizations");
export const getMyOrganization = () => api.get("/organizations/my");
export const createOrganization = (data) => api.post("/organizations", data);
export const updateOrgStatus = (id, status) =>
  api.put(`/organizations/${id}/status?status=${status}`);
export const regenerateOrgApiKey = (id) =>
  api.put(`/organizations/${id}/regenerate-key`);
export const deleteOrganization = (id) => api.delete(`/organizations/${id}`);
export const getOrgIssues = (orgId) =>
  api.get(`/organizations/${orgId}/issues`);
export const getEscalatedOrgIssues = (orgId) =>
  api.get(`/organizations/${orgId}/issues/escalated`);

// External / Public
export const externalLogin = (apiKey, data) =>
  api.post("/organizations/auth/external", data, {
    headers: { "X-Org-Api-Key": apiKey },
  });
export const getPublicOrgInfo = (slug) => api.get(`/public/org/${slug}`);
export const submitPublicComplaint = (slug, data, files = []) => {
  const fd = new FormData();
  fd.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  files.forEach((f) => fd.append("files", f));
  return api.post(`/public/org/${slug}/complaints`, fd);
};
export const trackComplaint = (ticketNumber, token) =>
  api.get(`/public/track/${ticketNumber}?token=${token}`);
export const publicReply = (ticketNumber, token, message) =>
  api.post(`/public/track/${ticketNumber}/reply?token=${token}`, { message });
export const reopenComplaint = (ticketNumber, token, reason) =>
  api.post(
    `/public/track/${ticketNumber}/reopen?token=${token}`,
    reason ? { reason } : {},
  );

// Notifications
export const getNotifications = () => api.get("/notifications");
export const markNotificationsRead = () => api.put("/notifications/read-all");

export default api;
