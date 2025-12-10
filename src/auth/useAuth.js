import { useMsal } from "@azure/msal-react";

export const useAuth = () => {
  const { accounts } = useMsal();

  console.log("useAuth accounts:", accounts);

  const account = accounts?.[0];
  const user = account?.name;
  const email = account?.username;

  if (!account) {
    throw new Error("No authenticated user found");
  }

  return { user, email };
};
