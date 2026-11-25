export type SocketStatus = 'disconnected' | 'connecting' | 'connected';

export interface SocketClient {
  connect: (url: string) => void;
  disconnect: () => void;
  send: (event: string, payload: unknown) => void;
  getStatus: () => SocketStatus;
}

export function createSocketClient(): SocketClient {
  let socket: WebSocket | null = null;
  let status: SocketStatus = 'disconnected';

  return {
    connect(url: string) {
      if (socket && status === 'connected') return;
      status = 'connecting';
      socket = new WebSocket(url);

      socket.onopen = () => {
        status = 'connected';
      };
      socket.onclose = () => {
        status = 'disconnected';
        socket = null;
      };
      socket.onerror = () => {
        status = 'disconnected';
      };
    },

    disconnect() {
      if (socket) {
        socket.close();
        socket = null;
      }
      status = 'disconnected';
    },

    send(event: string, payload: unknown) {
      if (!socket || status !== 'connected') return;
      socket.send(JSON.stringify({ event, payload }));
    },

    getStatus() {
      return status;
    },
  };
}

export const socketClient = createSocketClient();
