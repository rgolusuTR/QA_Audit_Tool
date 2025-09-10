import React, { useState } from "react";
import { URLInput } from "./components/URLInput";
import { AuditResults } from "./components/AuditResults";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SEOAuditResult } from "./types/seo";
import axios from "axios";

// Dynamic API URL detection for different environments
const getApiBaseUrl = () => {
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
    // For GitHub Pages, we need to use a publicly accessible Codespace URL
    // Use the known active Codespace URL - Updated for deployment
    return "https://organic-space-fishstick-rqpqvrw99w4f57x4-8000.app.github.dev";
  }

  // Default to localhost for local development
  return "http://localhost:8000";
};

const API_BASE_URL = getApiBaseUrl();

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SEOAuditResult | null>(null);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

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
