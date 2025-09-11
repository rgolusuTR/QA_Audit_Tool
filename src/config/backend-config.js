// Backend Configuration for QA Audit Tool
// This file manages the different backend options available

export const BACKEND_CONFIG = {
  // GitHub Actions backend (when running in GitHub Actions)
  GITHUB_ACTIONS: {
    enabled: true,
    // This will be dynamically set when running in GitHub Actions
    baseUrl: process.env.GITHUB_ACTIONS_BACKEND_URL || null,
    healthEndpoint: "/api/health",
    priority: 1, // Highest priority
  },

  // Codespace backends (existing configuration preserved)
  CODESPACES: {
    enabled: true,
    urls: [
      "https://organic-space-fishstick-rqpqvrw99w4f57x4-8000.app.github.dev",
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
    timeout: 5000, // 5 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
};

// Function to get all potential backend URLs in priority order
export const getAllBackendUrls = () => {
  const backends = [];

  // Add GitHub Actions backend if available
  if (
    BACKEND_CONFIG.GITHUB_ACTIONS.enabled &&
    BACKEND_CONFIG.GITHUB_ACTIONS.baseUrl
  ) {
    backends.push({
      url: BACKEND_CONFIG.GITHUB_ACTIONS.baseUrl,
      type: "github-actions",
      priority: BACKEND_CONFIG.GITHUB_ACTIONS.priority,
    });
  }

  // Add Codespace backends
  if (BACKEND_CONFIG.CODESPACES.enabled) {
    BACKEND_CONFIG.CODESPACES.urls.forEach((url) => {
      backends.push({
        url: url,
        type: "codespace",
        priority: BACKEND_CONFIG.CODESPACES.priority,
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

// Function to detect if running in GitHub Actions environment
export const isGitHubActions = () => {
  return (
    typeof process !== "undefined" &&
    process.env &&
    process.env.GITHUB_ACTIONS === "true"
  );
};

// Function to detect current environment
export const detectEnvironment = () => {
  if (isGitHubActions()) {
    return "github-actions";
  }

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

  return "production";
};

export default BACKEND_CONFIG;
