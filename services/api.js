import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response) {
      console.error(
        `API ${error.response.status}:`,
        error.config?.method?.toUpperCase(),
        error.config?.url,
        error.response.data
      );

      // Only remove login information when
      // the server explicitly says the token is invalid.
      if (
        error.response.status === 401 &&
        (
          error.response.data?.message ===
            "Invalid or expired token" ||
          error.response.data?.message ===
            "Invalid token payload"
        )
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;