/**
 * routes.jsx
 * Central route configuration.
 * Used by App.jsx to decide which page to render.
 * Extend this if you integrate React Router later.
 */
import ChatTab from "./tabs/ChatTab";
export const ROUTES = {
  LOGIN    : "login",
  OTP      : "otp",
  PROFILE  : "profile",
  DASHBOARD: "dashboard",
};