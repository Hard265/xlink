import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function UserLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        headerShadowVisible: false,
      }}
    />
  );
}
