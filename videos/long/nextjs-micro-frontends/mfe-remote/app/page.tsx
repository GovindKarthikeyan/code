import Counter from "@/components/Counter";
import UserProfile from "@/components/UserProfile";
import WebComponentRegistration from "@/components/WebComponentRegistration";

export default function Home() {
  return (
    <>
      <WebComponentRegistration />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              MFE Remote - Micro Frontend Components
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              This application exposes React components as Web Components that can be
              embedded in any host application. The components are server-side rendered
              by Next.js and hydrated on the client using Web Components.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Available Components (React View)
              </h2>
              <p className="text-gray-600 mb-4">
                Below are the React components that are exposed as Web Components:
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  1. Counter Component
                </h3>
                <Counter />
                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                  <p className="text-sm text-gray-700 font-mono">
                    Web Component Tag: <code className="text-blue-600">&lt;mfe-counter&gt;&lt;/mfe-counter&gt;</code>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  2. User Profile Component
                </h3>
                <UserProfile />
                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                  <p className="text-sm text-gray-700 font-mono mb-2">
                    Web Component Tag: <code className="text-blue-600">&lt;mfe-user-profile&gt;&lt;/mfe-user-profile&gt;</code>
                  </p>
                  <p className="text-sm text-gray-700 font-mono">
                    With props: <code className="text-blue-600">&lt;mfe-user-profile initialName="Jane" initialEmail="jane@example.com"&gt;&lt;/mfe-user-profile&gt;</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                How to Use in Host Application
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Run this MFE application in development mode</li>
                <li>The web components are automatically registered on page load</li>
                <li>In your host application, load this page in a hidden iframe or import the script</li>
                <li>Use the custom HTML tags in your host application</li>
                <li>The components will be hydrated on the client side</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
