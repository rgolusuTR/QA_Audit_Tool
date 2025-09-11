// Backend Configuration for QA Audit Tool
// This file manages the different backend options available

export const BACKEND_CONFIG = {
  // Primary Codespace backend (most recent/active)
  PRIMARY_CODESPACE: {
    enabled: true,
    baseUrl:
      "https://organic-space-fishstick-rqpqvrw99w4f57x4-8000.app.github.dev",
    healthEndpoint: "/api/health",
    priority: 1, // Highest priority
  },

  // Backup Codespace backends
  BACKUP_CODESPACES: {
    enabled: true,
    urls: [
      "https://scaling-space-enigma-w5x4q7g5xvwf5p9x-8000.app.github.dev",
      "https://friendly-space-disco-v7w9x4r6qpgj2k8m-8000.app.github.dev",
      "https://improved-space-journey-p9q2w5r8txnm3k7j-8000.app.github.dev",
    ],
    healthEndpoint: "/api/health",
    priority: 2,
  },

  // Local development backend
  LOCAL: {
    enabled: true,
    baseUrl: "http://localhost:8000",
    healthEndpoint: "/api/health",
    priority: 3, // Lowest priority
  },

  // Connection settings
  CONNECTION: {
    timeout: 3000, // 3 seconds (faster timeout)
    retryAttempts: 2, // Fewer retries for faster failover
    retryDelay: 500, // Faster retry
  },
};

// Function to get all potential backend URLs in priority order
export const getAllBackendUrls = () => {
  const backends = [];

  // Add primary Codespace backend
  if (BACKEND_CONFIG.PRIMARY_CODESPACE.enabled) {
    backends.push({
      url: BACKEND_CONFIG.PRIMARY_CODESPACE.baseUrl,
      type: "primary-codespace",
      priority: BACKEND_CONFIG.PRIMARY_CODESPACE.priority,
    });
  }

  // Add backup Codespace backends
  if (BACKEND_CONFIG.BACKUP_CODESPACES.enabled) {
    BACKEND_CONFIG.BACKUP_CODESPACES.urls.forEach((url) => {
      backends.push({
        url: url,
        type: "backup-codespace",
        priority: BACKEND_CONFIG.BACKUP_CODESPACES.priority,
      });
    });
  }

  // Add local backend
  if (BACKEND_CONFIG.LOCAL.enabled) {
    backends.push({
      url: BACKEND_CONFIG.LOCAL.baseUrl,
      type: "local",
      priority: BACKEND_CONFIG.LOCAL.priority,
    });
  }

  // Sort by priority (lower number = higher priority)
  return backends.sort((a, b) => a.priority - b.priority);
};

// Function to detect current environment
export const detectEnvironment = () => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname.includes("github.dev")
  ) {
    return "codespace";
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return "local";
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname.includes("github.io")
  ) {
    return "github-pages";
  }

  return "production";
};

// Function to get the most likely active Codespace URL
export const getActiveCodespaceUrl = () => {
  // Return the primary Codespace URL - this should be updated when you start a new Codespace
  return BACKEND_CONFIG.PRIMARY_CODESPACE.baseUrl;
};

export default BACKEND_CONFIG;
