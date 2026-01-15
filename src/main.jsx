import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication, EventType } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_APP_AZURE_APP_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_APP_AZURE_TENANT_ID
    }`,
    redirectUri: "http://localhost:5174/auth",

    /*     redirectUri: "https://sales.nfcfm.com/auth",
     */
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

const pca = new PublicClientApplication(msalConfig);

function Root() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      console.log("🟡 Initializing MSAL...");
      try {
        await pca.initialize();
        console.log("✅ MSAL initialized");

        // Handle redirect response FIRST - this must happen before routing
        const response = await pca.handleRedirectPromise();
        console.log("🔄 Redirect response:", response);

        if (response) {
          console.log("✅ User authenticated via redirect");
          pca.setActiveAccount(response.account);
        } else {
          // Set active account from cache if available
          const accounts = pca.getAllAccounts();
          console.log("📦 Cached accounts:", accounts);
          if (accounts.length === 1) {
            console.log("👤 Setting active account from cache");
            pca.setActiveAccount(accounts[0]);
          } else if (accounts.length > 1) {
            console.warn("⚠️ Multiple accounts found");
          }
        }

        // Mark as ready AFTER all auth processing is complete
        setIsReady(true);
        console.log("✅ MSAL ready, rendering app.");
      } catch (err) {
        console.error("💥 MSAL init error:", err);
        setIsReady(true); // Still render app to show error state
      }
    }

    init();
  }, []);

  if (!isReady) {
    return <div>Loading authentication...</div>;
  }

  return (
    <MsalProvider instance={pca}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MsalProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
