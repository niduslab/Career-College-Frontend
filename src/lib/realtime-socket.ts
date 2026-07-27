import { apiGet } from "./api";
import { config } from "./config";

/**
 * The backend WebSocket only accepts a raw JWT as `?token=` — it can't read
 * our HttpOnly `access_token` cookie. This endpoint is not built yet; ask the
 * backend team for `GET /auth/ws-token/` returning `{ token }` from the
 * caller's existing session cookie. Until then this rejects and callers
 * should treat realtime push as unavailable (REST polling still works).
 */
async function fetchWsToken(): Promise<string> {
  const res = await apiGet<{ token: string }>("/auth/ws-token/");
  const token = res.data?.token;
  if (!token) throw new Error("No ws token returned.");
  return token;
}

export type StreamEnvelope<T = unknown> = {
  stream: string;
  payload: T;
};

type Listener = (envelope: StreamEnvelope) => void;

const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000, 30000];

/**
 * One shared connection to `/ws/`, multiplexing all stream types
 * (notifications, messaging, …). Components subscribe via `onMessage` /
 * `send` rather than opening their own sockets.
 */
class PlatformSocket {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connecting = false;
  private stopped = false;
  private unavailable = false;

  connect(): void {
    if (this.socket || this.connecting || this.stopped || this.unavailable) return;
    this.connecting = true;

    fetchWsToken()
      .then((token) => {
        if (this.stopped) return;
        const url = `${config.wsBaseUrl}/ws/?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(url);

        ws.onopen = () => {
          this.reconnectAttempt = 0;
        };
        ws.onmessage = (event) => {
          let envelope: StreamEnvelope;
          try {
            envelope = JSON.parse(event.data);
          } catch {
            return;
          }
          this.listeners.forEach((fn) => fn(envelope));
        };
        ws.onclose = () => {
          this.socket = null;
          this.scheduleReconnect();
        };
        ws.onerror = () => {
          ws.close();
        };

        this.socket = ws;
      })
      .catch(() => {
        // No ws-token endpoint yet (or auth failed) — disable realtime push
        // for this session; REST polling remains the source of truth.
        this.unavailable = true;
      })
      .finally(() => {
        this.connecting = false;
      });
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.unavailable) return;
    const delay =
      RECONNECT_DELAYS_MS[
        Math.min(this.reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)
      ];
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  disconnect(): void {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }

  send(stream: string, payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ stream, payload }));
    }
  }

  onMessage(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

let sharedSocket: PlatformSocket | null = null;

/** Get (or lazily create) the single shared `/ws/` connection for this tab. */
export function getPlatformSocket(): PlatformSocket {
  if (!sharedSocket) sharedSocket = new PlatformSocket();
  return sharedSocket;
}
