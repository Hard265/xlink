import 'react-native-get-random-values';
import '../polyfills/text-encoding';
import {
  useFonts,
  Inter_500Medium,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Slot } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite/next';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { SessionProvider } from '../providers/SessionProvider';
import { databaseInit } from '../store/databaseInit';
import { db_name } from '../utilities/constants';

export default function Root() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_900Black,
    Pacifico_400Regular,
  });

  if (!fontsLoaded) {
    return <Fallback />;
  }

  return (
    <Suspense fallback={<Fallback />}>
      <SQLiteProvider databaseName={db_name} onInit={databaseInit} useSuspense>
        <SessionProvider>
          <Slot />
        </SessionProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
function Fallback() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
