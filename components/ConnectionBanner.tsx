import { Text, View } from 'react-native';

import { useSocket } from '../providers/SocketProvider';

export default function ConnectionBanner() {
  const { socket } = useSocket();
  return (
    <View>
      <Text>is connected: {socket?.connected ? 'true' : 'false'}</Text>
    </View>
  );
}
