import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import ProtectedRoute from "./components/protected-route";

import AppLayout from "./layouts/app-layout";
import LandingPage from "./pages/landing";
import Onboarding from "./pages/onboarding";
import JobListing from "./pages/job-listing";
import JobPage from "./pages/job";
import PostJob from "./pages/post-job";
import SavedJobs from "./pages/saved-job";
import MyJobs from "./pages/my-jobs";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        path: "/onboarding",
        element: (
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        ),
      },
      {
        path: "/jobs",
        element: (
          <ProtectedRoute>
            <JobListing />
          </ProtectedRoute>
        ),
      },
      {
        path: "/post-job",
        element: (
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-jobs",
        element: (
          <ProtectedRoute>
            <MyJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/saved-jobs",
        element: (
          <ProtectedRoute>
            <SavedJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/job/:id",
        element: (
          <ProtectedRoute>
            <JobPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

// Maintenance component (your new star)
function Maintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-black">
    🛠️🚧 MMTI Jobs Under Maintenance 🚧🛠️
      </h1>
      <p className="text-lg md:text-2xl text-gray-700 max-w-md">
        The UI is undergoing some 🔥 <strong>awesome changes</strong> 🔥.<br />
        We appreciate your patience. Please wait for a few hours — we’ll be back with a bang! 💥
      </p>
      <p className="mt-8 text-sm text-gray-500 italic">
        pls wait for a few hours — we are undergoing some visual changes! 💥
      </p>
    </div>
  );
}

function App() {
  // Toggle this to switch between maintenance and normal app
  const maintenanceMode = true; // <---- set to false to go live

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {maintenanceMode ? <Maintenance /> : <RouterProvider router={router} />}
    </ThemeProvider>
  );
}

export default App;
