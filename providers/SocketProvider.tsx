import React from "react";


const SocketContext = React.createContext<{
  socket: SocketIO | null;
  connected: boolean;
}>({
  secket: null,
  connected: false,
})

export function useSocket(){
  return React.useContext(SocketContext)
}

export function SocketProvider(props: React.PropsWithChildren<{url: string}>){
  const [connected, setConnected] = React.useState<boolean>(false);
  const [socket, setSocket] = React.useState<SocketIO | null>();
  
  React.useEffect(()=>{
    const sock = new SocketIO(props.url);
    
    sock.on("connected", ()=>{
      setSocket(sock);
      setConnected(true);
    });
    sock.on("disconnected", ()=>{
      setSocket(null);
      setConnected(false);
    })
    
    return ()=> {
      sock.off("connected");
      sock.off("disconnected")    
      sock.disconnect();
    }
  }, [props.url]);

  return (
    <SocketContext.Provider value={{socket, connected}}>
      {props.children}
    </SocketContext.Provider>
  );
}