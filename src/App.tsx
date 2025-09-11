import React, { useState, useEffect } from "react";
import { URLInput } from "./components/URLInput";
import { AuditResults } from "./components/AuditResults";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SEOAuditResult } from "./types/seo";
import axios from "axios";

// Helper function to create fetch with timeout using AbortController
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 5000
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Dynamic API URL detection with fallback mechanisms
const getApiBaseUrl = async () => {
  // Check if we're in a GitHub Codespace
  if (
    window.location.hostname.includes("github.dev") ||
    window.location.hostname.includes("githubpreview.dev")
  ) {
    // Extract the codespace name from the hostname
    const hostname = window.location.hostname;
    const codespaceUrl = hostname
      .replace(/\.github\.dev$/, "")
      .replace(/\.githubpreview\.dev$/, "");
    return `https://${codespaceUrl}-8000.app.github.dev`;
  }

  // Check if we're accessing via GitHub Pages
  if (window.location.hostname.includes("github.io")) {
    // Try multiple potential Codespace URLs
    const potentialUrls = [
      "https://organic-space-fishstick-rqpqvrw99w4f57x4-8000.app.github.dev",
      // Add more potential Codespace URLs as backups
      "https://scaling-space-enigma-w5x4q7g5xvwf5p9x-8000.app.github.dev",
      "https://friendly-space-disco-v7w9x4r6qpgj2k8m-8000.app.github.dev",
      "https://improved-space-journey-p9q2w5r8txnm3k7j-8000.app.github.dev",
    ];

    // Test each URL to find an active one
    for (const url of potentialUrls) {
      try {
        console.log(`🔍 Testing Codespace: ${url}`);
        const response = await fetchWithTimeout(
          `${url}/api/health`,
          {
            method: "GET",
          },
          5000
        );

        if (response.ok) {
          console.log(`✅ Found active Codespace: ${url}`);
          return url;
        }
      } catch (error) {
        console.log(`❌ Codespace not active: ${url}`);
        continue;
      }
    }

    // If no active Codespace found, return null to show setup instructions
    console.log("❌ No active Codespace found");
    return null;
  }

  // Default to localhost for local development
  return "http://localhost:8000";
};

// We'll get the API URL dynamically in the component
let API_BASE_URL: string | null = null;

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SEOAuditResult | null>(null);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>(
    "Checking backend connection..."
  );

  // Initialize API URL detection on component mount
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        console.log("🔄 Initializing API URL detection...");
        setConnectionStatus("Detecting backend server...");

        const apiUrl = await getApiBaseUrl();
        API_BASE_URL = apiUrl;

        if (apiUrl) {
          console.log("✅ Backend API URL initialized:", apiUrl);
          setConnectionStatus(`Connected to: ${apiUrl}`);
        } else {
          console.log("❌ No active backend found");
          setConnectionStatus("No active backend server found");
          setError(
            "No active Codespace backend found. Please start a new Codespace with the backend server running, or ensure your current Codespace is active and the backend is running on port 8000."
          );
        }
      } catch (error) {
        console.error("❌ Failed to initialize API URL:", error);
        setConnectionStatus("Failed to detect backend");
        setError(
          "Failed to detect backend server. Please check your connection and try refreshing the page."
        );
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApiUrl();
  }, []);

  const simulateProgress = () => {
    const steps = [
      "Connecting to backend API...",
      "Fetching webpage content...",
      "Parsing HTML structure...",
      "Extracting all links from page...",
      "🔍 PYTHON BACKEND: Making real HTTP requests...",
      "🌐 REQUESTS LIBRARY: Checking internal links...",
      "🔗 PROFESSIONAL VALIDATION: Testing external links...",
      "📊 BEAUTIFULSOUP: Parsing HTML content...",
      "⚡ RETRY LOGIC: Handling failed requests...",
      "🎯 REDIRECT CHAINS: Following redirects...",
      "📈 STATISTICS: Calculating success rates...",
      "🗂️ CATEGORIZATION: Grouping errors by type...",
      "Analyzing SEO metrics...",
      "Detecting spelling errors...",
      "Checking image optimization...",
      "Generating comprehensive report...",
      "⏳ DEEP ANALYSIS: Processing large websites...",
      "🔄 RETRY MECHANISMS: Handling slow responses...",
      "📋 FINAL VALIDATION: Completing analysis...",
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 4 + 2; // Slower progress for longer timeouts
      if (currentProgress >= 95) {
        currentProgress = 95; // Don't complete until actual response
      }

      setProgress(Math.min(currentProgress, 95));
      const stepIndex = Math.min(
        Math.floor(currentProgress / 5.5),
        steps.length - 1
      );
      setCurrentStep(steps[stepIndex]);
    }, 1200); // Slower updates for longer analyses

    return interval;
  };

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setError("");
    setProgress(0);
    setResults(null);

    // Check if API URL is available
    if (!API_BASE_URL) {
      setError(
        "Backend server is not configured. When accessing via GitHub Pages, you need to set up a GitHub Codespace with the backend server running. Please follow the setup instructions in the README."
      );
      setIsAnalyzing(false);
      return;
    }

    const progressInterval = simulateProgress();

    try {
      console.log("🚀 Starting backend SEO audit...");
      console.log("🔗 Using API URL:", API_BASE_URL);

      // Make request to Python backend
      const response = await axios.post(
        `${API_BASE_URL}/api/audit`,
        {
          url: url,
          max_concurrent: 15,
          timeout: 30,
        },
        {
          timeout: 300000, // 5 minute timeout for comprehensive analysis
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Backend analysis completed successfully");
      console.log("📊 Response data structure:", {
        url: response.data?.url,
        timestamp: response.data?.timestamp,
        seo_metrics: !!response.data?.seo_metrics,
        page_properties: !!response.data?.page_properties,
        link_results: response.data?.link_results?.length || 0,
        statistics: !!response.data?.statistics,
        misspellings: response.data?.misspellings?.length || 0,
        image_analysis: response.data?.image_analysis?.length || 0,
        pdf_links: response.data?.pdf_links?.length || 0,
        eloqua_form_fields: response.data?.eloqua_form_fields?.length || 0,
        errors_by_category: !!response.data?.errors_by_category,
      });

      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep("Analysis complete!");

      // Store the audited URL for responsiveness testing
      if (response.data?.url) {
        sessionStorage.setItem("auditedUrl", response.data.url);
        localStorage.setItem("lastAuditedUrl", response.data.url);
        (window as any).currentAuditUrl = response.data.url;
      }

      // Validate response data structure
      if (!response.data) {
        throw new Error("No data received from backend");
      }

      if (!response.data.seo_metrics) {
        throw new Error("Missing SEO metrics in response");
      }

      if (!response.data.statistics) {
        throw new Error("Missing statistics in response");
      }

      if (!response.data.errors_by_category) {
        throw new Error("Missing error categories in response");
      }

      setTimeout(() => {
        setResults(response.data);
        setIsAnalyzing(false);
      }, 1000);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("❌ Backend audit error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
      });

      let errorMessage = "An unexpected error occurred during analysis";

      if (
        err.code === "ECONNREFUSED" ||
        err.message?.includes("Network Error")
      ) {
        errorMessage =
          "Backend server is not running. Please start the Python backend server on port 8000.";
      } else if (
        err.code === "ECONNABORTED" ||
        err.message?.includes("timeout")
      ) {
        errorMessage = `Analysis timeout: The website took longer than 5 minutes to analyze. This can happen with large websites or slow servers. Please try again or contact support if the issue persists.`;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setIsAnalyzing(false);
    }
  };

  const handleNewAudit = () => {
    setResults(null);
    setError("");
    setProgress(0);
    setCurrentStep("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Connection Status Display */}
        {isInitializing && (
          <div className="max-w-4xl mx-auto mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Initializing Backend Connection
                </h3>
                <p className="text-sm text-blue-700">{connectionStatus}</p>
              </div>
            </div>
          </div>
        )}

        {!isInitializing && API_BASE_URL && (
          <div className="max-w-4xl mx-auto mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Backend Connected
                </h3>
                <p className="text-sm text-green-700">{connectionStatus}</p>
                <p className="text-xs text-green-600 mt-1">
                  ✅ Ready to analyze websites with dynamic Codespace detection
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Backend Connection Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  {error.includes("Backend server is not running") && (
                    <div className="mt-3 p-3 bg-red-100 rounded">
                      <p className="font-medium">
                        To start the backend server:
                      </p>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Open a terminal in the backend directory</li>
                        <li>
                          Run:{" "}
                          <code className="bg-red-200 px-1 rounded">
                            pip install -r requirements.txt
                          </code>
                        </li>
                        <li>
                          Run:{" "}
                          <code className="bg-red-200 px-1 rounded">
                            python main.py
                          </code>
                        </li>
                        <li>Server will start on http://localhost:8000</li>
                      </ol>
                    </div>
                  )}
                  {error.includes("Analysis timeout") && (
                    <div className="mt-3 p-3 bg-yellow-100 rounded">
                      <p className="font-medium">Timeout Solutions:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>
                          Large websites may take longer to analyze completely
                        </li>
                        <li>
                          Try analyzing a specific page instead of the entire
                          site
                        </li>
                        <li>
                          Check if the target website is responding slowly
                        </li>
                        <li>
                          Consider running the analysis during off-peak hours
                        </li>
                        <li>
                          The backend may still be processing - wait a moment
                          and try again
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!results && !isAnalyzing && (
          <URLInput onSubmit={handleAnalyze} isAnalyzing={isAnalyzing} />
        )}

        {isAnalyzing && (
          <LoadingSpinner progress={progress} currentStep={currentStep} />
        )}

        {results && !isAnalyzing && (
          <AuditResults results={results} onNewAudit={handleNewAudit} />
        )}
      </div>
    </div>
  );
}

export default App;
