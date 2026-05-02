import axios from "axios";

// Returns an Axios client that automatically includes a user's authentication token in all requests.
export function useAxiosClient() {
  // TODO: Does the React compiler auto-cache this or should we wrap it in a useMemo?
  const client = axios.create({});
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });
  return client;
}
