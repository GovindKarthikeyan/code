"use client";

import { useState } from "react";
import MFELoader from "@/components/MFELoader";
import WebComponentWrapper from "@/components/WebComponentWrapper";

export default function Home() {
  const [mfeLoaded, setMfeLoaded] = useState(false);
  const mfeUrl = "http://localhost:3001"; // MFE Remote URL

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Shell Host - Micro Frontend Container
          </h1>
          <p className="mt-2 text-gray-600">
            This is the shell application that consumes micro frontends as web components
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* MFE Loader Status */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            MFE Connection Status
          </h2>
          <MFELoader
            mfeUrl={mfeUrl}
            onLoad={() => {
              console.log("MFE loaded successfully");
              setMfeLoaded(true);
            }}
          />
        </div>

        {/* Content */}
        {mfeLoaded ? (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome to the Shell Host Application
              </h2>
              <p className="text-gray-600 mb-4">
                This page demonstrates the integration of micro frontends using web components.
                The components below are loaded from a separate Next.js application and embedded
                as custom HTML elements.
              </p>
            </div>

            {/* Section 1: Counter Component */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Counter Micro Frontend
              </h3>
              <p className="text-gray-600 mb-4">
                This counter component is loaded from the MFE Remote application:
              </p>
              <WebComponentWrapper tag="mfe-counter" />
            </div>

            {/* Section 2: User Profile Component */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                User Profile Micro Frontend
              </h3>
              <p className="text-gray-600 mb-4">
                This user profile component is loaded from the MFE Remote application:
              </p>
              <WebComponentWrapper tag="mfe-user-profile" />
            </div>

            {/* Section 3: User Profile with Custom Props */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                User Profile with Custom Props
              </h3>
              <p className="text-gray-600 mb-4">
                The same component with different initial values:
              </p>
              <WebComponentWrapper
                tag="mfe-user-profile"
                attributes={{
                  initialName: "Alice Johnson",
                  initialEmail: "alice.johnson@example.com",
                }}
              />
            </div>

            {/* Architecture Info */}
            <div className="bg-blue-50 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Architecture Overview
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>SSR:</strong> The shell host page is server-side rendered by Next.js
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Web Components:</strong> MFE components are registered as custom elements
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Client Hydration:</strong> Web components hydrate on the client using React
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Isolation:</strong> Each MFE runs in its own shadow DOM for style isolation
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">
              Waiting for MFE components to load...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure the MFE Remote application is running on {mfeUrl}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
