import axios from "axios";

import { env } from "../config/env";

export const gatewayHttp = axios.create({
  baseURL: env.apiGatewayUrl,
  headers: {
    "Content-Type": "application/json",
    ...(env.apiKey ? { apikey: env.apiKey } : {}),
  },
});
