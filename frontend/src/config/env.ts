export const env = {
  apiGatewayUrl: import.meta.env.VITE_API_GATEWAY_URL ?? "http://localhost:8000",
  notificationsApiUrl: import.meta.env.VITE_NOTIFICATIONS_API_URL ?? "http://localhost:3004",
  analyticsApiUrl: import.meta.env.VITE_ANALYTICS_API_URL ?? "http://localhost:3005",
  apiKey: import.meta.env.VITE_API_KEY ?? "",
};
