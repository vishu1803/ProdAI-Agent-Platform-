import { globalTelemetry } from "./TelemetryTracker";

// Expose singleton for easy usage across API routes and hooks
export { globalTelemetry };
export * from "./TelemetryTracker";
