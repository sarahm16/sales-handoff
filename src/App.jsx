import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";

// Route imports
import Auth from "./pages/Auth/Auth.jsx";
import Handoffs from "./pages/Handoffs/Handoffs.jsx";
import OpenHandoff from "./pages/OpenHandoff/Openhandoff.jsx";

// Component imports
import Layout from "./components/PageLayout.jsx";
import HandoffForm from "./pages/HandoffForm/HandoffForm.jsx";

const NotFound = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
};

function ProtectedRoute({ children }) {
  const { accounts, instance, inProgress } = useMsal();
  const location = useLocation();

  const isAuthenticated = accounts && accounts.length > 0;

  useEffect(() => {
    // Don't trigger redirect if MSAL is still processing
    if (inProgress !== "none") {
      return;
    }

    if (!isAuthenticated) {
      sessionStorage.setItem("postLoginRedirect", location.pathname);
      instance.loginRedirect({ scopes: ["User.Read"] });
    }
  }, [isAuthenticated, instance, location.pathname, inProgress]);

  // Show loading while MSAL is processing
  if (inProgress !== "none") {
    return <div>Processing authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting to sign in...</div>;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirect after successful login
  useEffect(() => {
    if (location.pathname === "/auth" && accounts.length > 0) {
      const redirectPath = sessionStorage.getItem("postLoginRedirect") || "/";
      sessionStorage.removeItem("postLoginRedirect");
      console.log("🔀 Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [location.pathname, accounts, navigate]);

  return (
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
      <Route
        exact
        path="/handoffs/:id"
        element={
          <ProtectedRoute>
            <OpenHandoff />
          </ProtectedRoute>
        }
      />
      <Route
        exact
        path="/form"
        element={
          <ProtectedRoute>
            <HandoffForm />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
