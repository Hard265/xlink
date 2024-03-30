import React from 'react';
import { Socket, io } from 'socket.io-client';

const SocketContext = React.createContext<{
  socket: Socket | null;
  connected: boolean;
}>({
  socket: null,
  connected: false,
});

export function useSocket() {
  return React.useContext(SocketContext);
}

export function SocketProvider(props: React.PropsWithChildren<{ url: string }>) {
  const [connected, setConnected] = React.useState<boolean>(false);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  React.useEffect(() => {
    const sock = io(props.url);

    sock.on('connected', () => {
      setSocket(sock);
      setConnected(true);
    });
    sock.on('disconnected', () => {
      setSocket(null);
      setConnected(false);
    });

    return () => {
      sock.off('connected');
      sock.off('disconnected');
      sock.disconnect();
    };
  }, [props.url]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>{props.children}</SocketContext.Provider>
  );
}
