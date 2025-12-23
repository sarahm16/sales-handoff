import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { accounts, instance, inProgress } = useMsal();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    console.log(
      "🔍 Auth page - inProgress:",
      inProgress,
      "accounts:",
      accounts
    );

    // Wait for MSAL to finish any in-progress operations
    if (inProgress === "none" && !hasChecked) {
      setHasChecked(true);

      if (accounts && accounts.length > 0) {
        const redirectPath =
          sessionStorage.getItem("postLoginRedirect") || "/handoffs";
        sessionStorage.removeItem("postLoginRedirect");
        console.log("✅ Auth complete, navigating to:", redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        // No accounts found, redirect back to login
        console.log("❌ No accounts found after redirect, triggering login");
        instance.loginRedirect({ scopes: ["User.Read"] });
      }
    }
  }, [accounts, navigate, inProgress, hasChecked, instance]);

  return <div>Signing you in...</div>;
}
