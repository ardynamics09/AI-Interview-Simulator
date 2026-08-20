import axios from "axios";

const getApiBaseUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (typeof window !== "undefined" && window.location && window.location.hostname === "localhost") {
    return "http://localhost:8000";
  }
  return "http://127.0.0.1:8000";
};

const API_BASE_URL = getApiBaseUrl();
const ADMIN_TOKEN_KEY = "ai_simulator_admin_token";
const ADMIN_USER_KEY = "ai_simulator_admin_user";

export function getAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch (e) {
    return "";
  }
}

export function setAdminToken(token, user = null, remember = false) {
  try {
    if (remember) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      if (user) localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      if (user) sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    }
  } catch (e) {}
}

export function getAdminUser() {
  try {
    const raw = sessionStorage.getItem(ADMIN_USER_KEY) || localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearAdminSession() {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  } catch (e) {}
}

function getAuthHeaders() {
  const token = getAdminToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

// 1. Check if Admin is initialized
export async function checkAdminStatus() {
  const response = await axios.get(`${API_BASE_URL}/admin/status`);
  return response.data;
}

// 2. One-time Admin Setup
export async function setupAdmin({ email, username, password }) {
  const response = await axios.post(`${API_BASE_URL}/admin/setup`, { email, username, password });
  if (response.data && response.data.token) {
    setAdminToken(response.data.token, response.data.admin);
  }
  return response.data;
}

// 3. Admin Login
export async function loginAdmin({ email, password, remember = false }) {
  const response = await axios.post(`${API_BASE_URL}/admin/login`, { email, password });
  if (response.data && response.data.token) {
    setAdminToken(response.data.token, response.data.admin, remember);
  }
  return response.data;
}

// 4. Forgot Password (OTP Request)
export async function forgotPassword({ email }) {
  const response = await axios.post(`${API_BASE_URL}/admin/forgot-password`, { email });
  return response.data;
}

// 5. Reset Password with OTP
export async function resetPassword({ email, otp, new_password }) {
  const response = await axios.post(`${API_BASE_URL}/admin/reset-password`, { email, otp, new_password });
  return response.data;
}

// 6. Verify Admin Session
export async function verifyAdminSession() {
  const token = getAdminToken();
  if (!token) return { authenticated: false };
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/me`, getAuthHeaders());
    return { authenticated: true, admin: response.data.admin };
  } catch (err) {
    clearAdminSession();
    return { authenticated: false };
  }
}

// 7. Protected Analytics Endpoints
export async function fetchOverviewAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/overview`, getAuthHeaders());
  return res.data;
}

export async function fetchUserAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/users`, getAuthHeaders());
  return res.data;
}

export async function fetchInterviewAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/interviews`, getAuthHeaders());
  return res.data;
}

export async function fetchScoreAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/scores`, getAuthHeaders());
  return res.data;
}

export async function fetchBranchAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/branches`, getAuthHeaders());
  return res.data;
}

export async function fetchRoleAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/roles`, getAuthHeaders());
  return res.data;
}

export async function fetchPerformanceTrend(period = "all") {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/performance-trend?period=${period}`, getAuthHeaders());
  return res.data;
}

export async function fetchDsaAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/dsa`, getAuthHeaders());
  return res.data;
}

export async function fetchVerilogAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/verilog`, getAuthHeaders());
  return res.data;
}

export async function fetchCommunicationAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/communication`, getAuthHeaders());
  return res.data;
}

export async function fetchCameraAnalytics() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/camera`, getAuthHeaders());
  return res.data;
}

export async function fetchRecentActivity() {
  const res = await axios.get(`${API_BASE_URL}/admin/analytics/recent-activity`, getAuthHeaders());
  return res.data;
}

export async function fetchRecentTests(filters = {}) {
  const params = new URLSearchParams();
  if (filters.branch) params.append("branch", filters.branch);
  if (filters.role) params.append("role", filters.role);
  if (filters.interviewType) params.append("interview_type", filters.interviewType);
  if (filters.minScore !== undefined && filters.minScore !== "") params.append("min_score", filters.minScore);
  if (filters.maxScore !== undefined && filters.maxScore !== "") params.append("max_score", filters.maxScore);

  const res = await axios.get(`${API_BASE_URL}/admin/analytics/recent-tests?${params.toString()}`, getAuthHeaders());
  return res.data;
}

// 8. Public Sync Endpoints
export async function syncUserProfileToBackend(profile) {
  try {
    await axios.post(`${API_BASE_URL}/api/users/profile`, profile);
  } catch (err) {
    // Non-blocking
  }
}

export async function syncInterviewToBackend(testPayload) {
  try {
    await axios.post(`${API_BASE_URL}/api/interviews/record`, testPayload);
  } catch (err) {
    // Non-blocking
  }
}


export async function resetPasswordWithSecurityAnswer({ email, security_answer, new_password }) {
  const response = await axios.post(`${API_BASE_URL}/admin/reset-password-security`, {
    email,
    security_answer,
    new_password
  });
  return response.data;
}
