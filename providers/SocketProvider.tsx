import { useSQLiteContext } from 'expo-sqlite/next';
import React from 'react';
import { Socket, io } from 'socket.io-client';

import store, { Message } from '../store/store';

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
  const db = useSQLiteContext();

  React.useEffect(() => {
    setSocket(
      io(props.url, { transports: ['polling'] })
        .on('connected', () => {
          setConnected(true);
        })
        .on('message', (data) => {
          console.log(data);
          store.receive(db, JSON.parse(data) as Message);
        })
        .on('disconnected', () => {
          setSocket(null);
          setConnected(false);
        }),
    );

    return () => {
      socket?.off('connected');
      socket?.off('disconnected');
      socket?.disconnect();
    };
  }, [props.url]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>{props.children}</SocketContext.Provider>
  );
}
