/**
 * Keep-Alive Web Worker
 * Runs in a separate thread — NOT throttled by Chrome when the tab is minimized/hidden.
 * Sends a 'ping' message to the main thread every 1 second so the main thread
 * can check and restore YouTube playback without relying on throttled setInterval.
 */
let interval = null;

self.onmessage = (e) => {
  if (e.data === 'start') {
    if (interval) return;
    interval = setInterval(() => {
      self.postMessage('ping');
    }, 1000);
  } else if (e.data === 'stop') {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
};
