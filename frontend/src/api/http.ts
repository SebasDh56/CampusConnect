import axios from "axios";

import { env } from "../config/env";

export const gatewayHttp = axios.create({
  baseURL: env.apiGatewayUrl,
  headers: {
    "Content-Type": "application/json",
    ...(env.apiKey ? { apikey: env.apiKey } : {}),
  },
});

export const notificationsHttp = axios.create({
  baseURL: env.notificationsApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const analyticsHttp = axios.create({
  baseURL: env.analyticsApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
