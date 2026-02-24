import React, { useState } from "react";
import { URLInput } from "./components/URLInput";
import { AuditResults } from "./components/AuditResults";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SEOAuditResult } from "./types/seo";
import { performClientSideAudit } from "./utils/clientAudit";

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SEOAuditResult | null>(null);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setError("");
    setProgress(0);
    setResults(null);
    setCurrentStep("Initializing analysis...");

    try {
      console.log("🚀 Starting client-side SEO audit...");
      console.log("🔗 Analyzing URL:", url);

      // Perform client-side audit with progress updates
      const auditResults = await performClientSideAudit(url, (prog, step) => {
        setProgress(prog);
        setCurrentStep(step);
      });

      console.log("✅ Client-side analysis completed successfully");
      console.log("📊 Results:", {
        url: auditResults.url,
        seo_metrics: !!auditResults.seo_metrics,
        link_results: auditResults.link_results?.length || 0,
        statistics: !!auditResults.statistics,
        misspellings: auditResults.misspellings?.length || 0,
        image_analysis: auditResults.image_analysis?.length || 0,
      });

      // Store the audited URL for responsiveness testing
      if (auditResults.url) {
        sessionStorage.setItem("auditedUrl", auditResults.url);
        localStorage.setItem("lastAuditedUrl", auditResults.url);
        (window as any).currentAuditUrl = auditResults.url;
      }

      setTimeout(() => {
        console.log('📊 Setting results state...');
        setResults(auditResults);
        setIsAnalyzing(false);
        console.log('✅ Results state updated, rendering results component');
      }, 500);
    } catch (err: any) {
      console.error("❌ Client-side audit error:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
      });

      let errorMessage = "An unexpected error occurred during analysis";

      if (err.message?.includes("Failed to fetch")) {
        errorMessage =
          "Unable to fetch the webpage. This could be due to CORS restrictions or the website being unavailable. Please ensure the URL is correct and accessible.";
      } else if (err.message?.includes("Invalid URL")) {
        errorMessage =
          "Invalid URL format. Please enter a valid URL starting with http:// or https://";
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
        {/* Info Banner */}
        <div className="max-w-4xl mx-auto mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Client-Side QA Audit Tool
              </h3>
              <p className="text-sm text-blue-700">
                ✅ No backend required - All analysis runs in your browser
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Note: Some features like external link checking may be limited due to browser CORS restrictions
              </p>
            </div>
          </div>
        </div>

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
                  Analysis Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  {error.includes("CORS") && (
                    <div className="mt-3 p-3 bg-red-100 rounded">
                      <p className="font-medium">CORS Restrictions:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                          Some websites block cross-origin requests for security
                        </li>
                        <li>
                          Try analyzing websites that allow CORS or use the same
                          domain
                        </li>
                        <li>
                          Internal company websites may work better than external
                          sites
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
          <div>
            {(() => {
              try {
                console.log('🎨 Rendering AuditResults component with:', {
                  hasResults: !!results,
                  url: results?.url,
                  hasSeoMetrics: !!results?.seo_metrics,
                  hasStatistics: !!results?.statistics,
                });
                return <AuditResults results={results} onNewAudit={handleNewAudit} />;
              } catch (renderError: any) {
                console.error('❌ Error rendering results:', renderError);
                return (
                  <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Error Displaying Results
                    </h3>
                    <p className="text-red-700 mb-4">{renderError.message}</p>
                    <button
                      onClick={handleNewAudit}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;