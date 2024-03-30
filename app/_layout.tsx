import 'react-native-get-random-values';
import '../polyfills/text-encoding';
import { Slot } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite/next';
import { Suspense } from 'react';
import { Text } from 'react-native';

import { SocketProvider, SessionProvider } from '../providers'
import { databaseInit } from '../store/databaseInit';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <Suspense fallback={<Fallback />}>
      <SQLiteProvider databaseName="test2.db" onInit={databaseInit} useSuspense>
        <SessionProvider>
          <SocketProvider url="">
            <Slot />
          </SocketProvider>
        </SessionProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

function Fallback() {
  return <Text>Loading.....</Text>;
}
