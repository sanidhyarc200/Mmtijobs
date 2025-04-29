import React, { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Button } from "@/components/ui/button";

// 👇 Your actual ComingSoon component
function ComingSoon() {
  const [notified, setNotified] = useState(false);

  const handleNotifyClick = () => {
    setNotified(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">
        🚀 MMTiJobs — The Future of Hiring
      </h1>
      <p className="text-xl text-purple-400 font-semibold mb-6 text-center tracking-widest">
      COMING SOON
      </p>
      <p className="text-lg md:text-xl text-gray-300 text-center max-w-xl mb-8">
        Apply for jobs, post roles, and hire top talent effortlessly. <br />
        <span className="text-white font-semibold">
          Smart filters. Fast matches. Zero noise.
        </span>
      </p>
      <Button
        onClick={handleNotifyClick}
        className="bg-white text-black hover:bg-gray-200 text-lg px-6 py-3 rounded-xl shadow-lg transition"
      >
        {notified ? "✅ You're Subscribed" : "Notify Me"}
      </Button>
    </div>
  );
}

// 👇 Use ComingSoon as the layout/page
function AppLayout() {
  return <ComingSoon />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
