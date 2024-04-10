import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { useSocket } from '../providers/SocketProvider';

export default function ConnectionBanner() {
  const { socket } = useSocket();

  useEffect(() => {}, [socket?.connected]);
  return (
    <View className="bg-white">
      <Text className="dark:text-white">is connected: {socket?.connected ? 'true' : 'false'}</Text>
    </View>
  );
}
