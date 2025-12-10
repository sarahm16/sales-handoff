import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Route, Routes, useLocation } from "react-router-dom";

// Route imports
import Auth from "./pages/Auth/Auth.jsx";
import Handoffs from "./pages/Handoffs/Handoffs.jsx";

// Component imports
import Layout from "./components/PageLayout.jsx";

function ProtectedRoute({ children }) {
  const { accounts, instance } = useMsal();
  const location = useLocation();

  const isAuthenticated = accounts && accounts?.length > 0;

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem("postLoginRedirect", location.pathname);
      instance.loginRedirect({ scopes: ["User.Read"] });
    }
  }, [isAuthenticated, instance, location.pathname]);

  if (!isAuthenticated) {
    return <div>Redirecting to sign in...</div>; // or a loading spinner
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <>
      <Routes>
        <Route exact path="/auth" element={<Auth />} />
        <Route
          exact
          path="/"
          element={
            <ProtectedRoute>
              <Handoffs />
            </ProtectedRoute>
          }
        />
        <Route
          exact
          path="/handoffs"
          element={
            <ProtectedRoute>
              <Handoffs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
