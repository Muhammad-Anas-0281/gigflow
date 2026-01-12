const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const AUTH_API_END_POINT = `${API_BASE_URL}/api/auth`;
export const GIG_API_END_POINT = `${API_BASE_URL}/api/gigs`;
export const BID_API_END_POINT = `${API_BASE_URL}/api/bids`;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

