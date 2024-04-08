import 'react-native-get-random-values';
import '../polyfills/text-encoding';
import { Slot } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite/next';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { SessionProvider } from '../providers/SessionProvider';
import { SocketProvider } from '../providers/SocketProvider';
import { databaseInit } from '../store/databaseInit';
import { db_name } from '../utilities/constants';

export default function Root() {
  const socketUrl = '';

  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      }>
      <SQLiteProvider databaseName={db_name} onInit={databaseInit} useSuspense>
        <SessionProvider>
          <SocketProvider url={socketUrl}>
            <Slot />
          </SocketProvider>
        </SessionProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
