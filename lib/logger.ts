// A tiny leveled logger used across the app. Instead of scattering raw
// console.log calls, every layer logs through this so messages are consistent
// (a [scope] tag + message + optional data) and easy to silence.
//
// It's gated by __DEV__, so production builds stay quiet automatically.
//
// Usage:
//   log.info('auth', 'signed in', { userId });
//   log.error('api/transactions', 'fetch failed', error);

type Level = 'debug' | 'info' | 'warn' | 'error';

function emit(level: Level, scope: string, message: string, data?: unknown) {
  if (!__DEV__) return;

  const tag = `[${scope}]`;
  const args = data === undefined ? [tag, message] : [tag, message, data];

  // Map our levels onto the console; 'debug' uses console.log for visibility.
  const fn = level === 'debug' ? console.log : console[level];
  fn(...args);
}

export const log = {
  debug: (scope: string, message: string, data?: unknown) =>
    emit('debug', scope, message, data),
  info: (scope: string, message: string, data?: unknown) =>
    emit('info', scope, message, data),
  warn: (scope: string, message: string, data?: unknown) =>
    emit('warn', scope, message, data),
  error: (scope: string, message: string, data?: unknown) =>
    emit('error', scope, message, data),
};
