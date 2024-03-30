import { Redirect, Stack } from 'expo-router';
import { Text } from 'react-native';

import { useSession } from '../../providers/SessionProvider';

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <Text>Loading2...</Text>;
  }

  console.log(session);
  if (!session) {
    
    return <Redirect href="/sign-in" />;
  }

  return <Stack />;
}
