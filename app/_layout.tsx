import 'react-native-get-random-values';
import '../polyfills/text-encoding';
import { Slot } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite/next';
import { Suspense } from 'react';
import { View } from 'react-native';

import { SessionProvider } from '../providers/SessionProvider';
import { databaseInit } from '../store/databaseInit';

export default function Root() {
  const socketUrl = '';

  return (
    <Suspense fallback={<Fallback />}>
      <SQLiteProvider databaseName="test2.db" onInit={databaseInit} useSuspense>
        <SessionProvider>
          {/* <SocketProvider url={socketUrl}> */}
            <Slot />
          {/* </SocketProvider> */}
        </SessionProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

function Fallback() {
  return <View>Loading.....</View>;
}
