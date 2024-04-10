import { Redirect, Stack } from 'expo-router';
import { Text, useColorScheme } from 'react-native';

import { SocketProvider } from '../../providers';
import { useSession } from '../../providers/SessionProvider';

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();
  const socketURL = 'https://trusted-currently-bobcat.ngrok-free.app';

  if (isLoading) {
    return <Text>Loading2...</Text>;
  }
  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SocketProvider url={socketURL}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        }}>
        <Stack.Screen name="index" options={{ headerShown: true }} />
        <Stack.Screen name="[address]" options={{ headerShown: false }} />
      </Stack>
    </SocketProvider>
  );
}
