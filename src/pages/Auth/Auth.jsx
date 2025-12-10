import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { accounts } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    // The redirect has already been handled in main.jsx
    // We just need to navigate to the intended destination
    if (accounts && accounts.length > 0) {
      const redirectPath =
        sessionStorage.getItem("postLoginRedirect") || "/handoffs";
      sessionStorage.removeItem("postLoginRedirect");
      console.log("✅ Auth complete, navigating to:", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [accounts, navigate]);

  return <div>Signing you in...</div>;
}
