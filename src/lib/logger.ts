/**
 * Logging that only prints in development to avoid console noise in production.
 * Use logErrorCritical for messages that must show in production (e.g. config).
 */
const isDev = import.meta.env.DEV;

export function logError(message: string, err?: unknown): void {
  if (isDev) console.error(message, err ?? '');
}

export function logWarn(message: string, ...args: unknown[]): void {
  if (isDev) console.warn(message, ...args);
}

export function logErrorCritical(message: string, err?: unknown): void {
  console.error(message, err ?? '');
}
