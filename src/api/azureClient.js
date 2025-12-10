import axios from "axios";

export const azureClient = axios.create({
  baseURL: `${import.meta.env.VITE_PROXY_URL}/${
    import.meta.env.VITE_AZURE_FUNCTIONS_URL
  }`,
  headers: {
    "Content-Type": "application/json",
  },
});
