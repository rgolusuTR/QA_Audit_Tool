import React, { useState, useEffect } from "react";
import "./App.css";

interface AuditResult {
  url: string;
  timestamp: string;
  seo_metrics: any;
  link_results: any[];
  statistics: any;
  // ... other properties
}

const App: React.FC = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState(
    "Checking connection..."
  );
  const [apiBaseUrl, setApiBaseUrl] = useState("");

  // Railway URL - Replace with your actual Railway deployment URL
  const RAILWAY_API_URL = "https://your-app-name.railway.app"; // 🔥 UPDATE THIS WITH YOUR RAILWAY URL

  // Fetch with timeout using AbortController
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 10000
  ): Promise<Response> => {
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

  // Get API base URL - Now uses Railway for 24/7 uptime
  const getApiBaseUrl = async (): Promise<string> => {
    console.log("🔍 Connecting to Railway backend...");

    try {
      // Test Railway backend health
      const response = await fetchWithTimeout(
        `${RAILWAY_API_URL}/api/health`,
        {},
        5000
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Railway backend connected:", data);
        setConnectionStatus(
          `✅ Connected to Railway backend (${data.version})`
        );
        return RAILWAY_API_URL;
      } else {
        throw new Error(`Railway backend returned status: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Railway backend connection failed:", error);
      setConnectionStatus("❌ Railway backend connection failed");
      throw new Error("Railway backend is not available");
    }
  };

  // Initialize connection on component mount
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        setApiBaseUrl(baseUrl);
      } catch (error) {
        console.error("Failed to initialize connection:", error);
        setError(
          "Failed to connect to Railway backend. Please check if the backend is deployed."
        );
      }
    };

    initializeConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!apiBaseUrl) {
      setError(
        "Backend connection not established. Please wait or refresh the page."
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("🚀 Starting SEO audit...");
      const response = await fetchWithTimeout(
        `${apiBaseUrl}/api/audit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
            max_concurrent: 15,
            timeout: 30,
          }),
        },
        120000
      ); // 2 minute timeout for audit

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      setResult(data);
      console.log("✅ SEO audit completed successfully");
    } catch (error: any) {
      console.error("❌ SEO audit failed:", error);
      if (error.name === "AbortError") {
        setError(
          "Request timed out. The website might be taking too long to analyze."
        );
      } else {
        setError(`Audit failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Professional SEO Audit Tool
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Comprehensive website analysis with broken link detection, SEO
            metrics, and more
          </p>

          {/* Connection Status */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm border">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus.includes("✅")
                    ? "bg-green-500"
                    : connectionStatus.includes("❌")
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              ></div>
              <span>{connectionStatus}</span>
            </div>
          </div>

          {/* Railway Info */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-600 font-medium">
                🚀 Now running 24/7 on Railway!
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              No more Codespace interruptions - your backend is always available
            </p>
          </div>
        </div>

        {/* Audit Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Website URL to Audit
              </label>
              <div className="flex space-x-4">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !apiBaseUrl}
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    "Start Audit"
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">❌</span>
                  <span className="text-red-700 font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📊 Audit Results for {result.url}
            </h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.statistics?.total_links || 0}
                </div>
                <div className="text-sm text-blue-600">Total Links</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.statistics?.working_links || 0}
                </div>
                <div className="text-sm text-green-600">Working Links</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.statistics?.broken_links || 0}
                </div>
                <div className="text-sm text-red-600">Broken Links</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {result.statistics?.success_rate?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-purple-600">Success Rate</div>
              </div>
            </div>

            {/* SEO Metrics */}
            {result.seo_metrics && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🎯 SEO Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-700">Title</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {result.seo_metrics.title || "No title found"}
                      <span className="ml-2 text-xs">
                        ({result.seo_metrics.title_length} chars)
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-700">
                      Meta Description
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {result.seo_metrics.meta_description ||
                        "No meta description found"}
                      <span className="ml-2 text-xs">
                        ({result.seo_metrics.meta_description_length} chars)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Broken Links */}
            {result.link_results &&
              result.link_results.filter((link) => !link.is_working).length >
                0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    🔗 Broken Links
                  </h3>
                  <div className="space-y-3">
                    {result.link_results
                      .filter((link) => !link.is_working)
                      .slice(0, 10)
                      .map((link, index) => (
                        <div
                          key={index}
                          className="p-4 border border-red-200 bg-red-50 rounded-lg"
                        >
                          <div className="font-medium text-red-800">
                            {link.url}
                          </div>
                          <div className="text-sm text-red-600 mt-1">
                            {link.anchor_text} -{" "}
                            {link.error_message ||
                              `Status: ${link.status_code}`}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            <div className="text-sm text-gray-500 mt-6">
              Audit completed at {result.timestamp} • Powered by Railway 24/7
              backend
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
