import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_APP_AZURE_APP_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_APP_AZURE_TENANT_ID
    }`,
    redirectUri: window.location.origin,
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

        const response = await pca.handleRedirectPromise();
        console.log("🟢 handleRedirectPromise() returned:", response);

        if (response && response.account) {
          console.log("👤 Setting active account from redirect result");
          pca.setActiveAccount(response.account);
        } else {
          const accounts = pca.getAllAccounts();
          console.log("📦 Cached accounts:", accounts);
          if (accounts.length === 1) {
            console.log("👤 Setting active account from cache");
            pca.setActiveAccount(accounts[0]);
          } else if (accounts.length > 1) {
            console.warn(
              "⚠️ Multiple accounts found; you may need account selection logic."
            );
          } else {
            console.log("❌ No accounts found — not signed in.");
          }
        }

        setIsReady(true);
        console.log("✅ MSAL ready, rendering app.");
      } catch (err) {
        console.error("💥 MSAL init error:", err);
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
