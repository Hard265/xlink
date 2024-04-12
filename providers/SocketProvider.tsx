import { useSQLiteContext } from 'expo-sqlite/next';
import React, { useEffect } from 'react';
import { Socket, io } from 'socket.io-client';

import { useSession } from './SessionProvider';
import store, { MESSAGE_STATE, Message } from '../store/store';

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
  const { session } = useSession();
  const db = useSQLiteContext();

  useEffect(function didMount() {
    const socket = io(props.url, {
      transports: ['websocket'],
      extraHeaders: {
        user: session?.address as string,
      },
    });
    setSocket(socket);

    socket.io.on('open', () => {
      setConnected(true);
      store.onSocketConnection(db, socket, session);
    });

    socket.on('message', (data: Message) => {
      store.receive(db, data as Message);
      socket.emit('delivered', { id: data.id, sender: data.sender, receiver: data.receiver });
    });

    //handle message delivery report
    socket.on('delivered', (mid: string) => {
      store.updateMessage(db, mid, { state: MESSAGE_STATE.DELIVERED });
    });

    socket.io.on('close', () => setConnected(false));

    return function didUnmount() {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, []);

  return <SocketContext.Provider value={{ socket, connected }}>{props.children}</SocketContext.Provider>;
}
