import { useSQLiteContext } from 'expo-sqlite/next';
import React, { useEffect } from 'react';
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

  useEffect(function didMount() {
    const socket = io(props.url, {
      transports: ['websocket'],
    });
    setSocket(socket);

    socket.io.on('open', () => {
      setConnected(true);
      socket.emit;
    });

    socket.io.on('close', () => setConnected(false));

    socket.on('message', (data) => {
      store.receive(db, data as Message);
    });

    return function didUnmount() {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>{props.children}</SocketContext.Provider>
  );
}
