import { Feather } from '@expo/vector-icons';
import { BarCodeScanningResult } from 'expo-camera/build/Camera.types';
import { CameraView } from 'expo-camera/next';
import { Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '../../providers/SessionProvider';
import store from '../../store/store';

export default observer(() => {
  const db = useSQLiteContext();
  const { session } = useSession();
  const [scanning, setScanning] = useState(false);
  const onqrscan = (scanningResult: BarCodeScanningResult) => {
    const address = scanningResult.data;
    router.replace(`/(app)/${address}/chat`);
  };
  const users = _.filter(store.users, (user) => user.address !== session?.address);

  return (
    <View className="flex-1 p-2">
      <FlatList
        ListHeaderComponent={
          <Pressable
            onPress={() => setScanning(true)}
            className="flex w-full justify-center rounded-md bg-slate-300 p-2">
            <Text className="text-sm font-medium leading-6 text-slate-950 text-center">
              scan address
            </Text>
          </Pressable>
        }
        data={users}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.replace(`/(app)/${item.address}/chat`)}
            className="w-full py-1 flex flex-row gap-x-2 items-center">
            <View className="p-2 px-4 rounded-full bg-gray-200">
              <Text className="text-xl uppercase">{item.address.substring(0, 1)}</Text>
            </View>
            <View className="flex-1 flex flex-col items-start">
              <Text>{item.address}</Text>
            </View>
          </Pressable>
        )}
      />
      <Modal visible={scanning} statusBarTranslucent onRequestClose={() => setScanning(false)}>
        <CameraView
          style={[StyleSheet.absoluteFill]}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={onqrscan}
        />
      </Modal>
      <Stack.Screen
        options={{
          headerTitleAlign: 'center',
          headerRight(props) {
            return <Feather name="rotate-ccw" size={24} color={props.tintColor} />;
          },
        }}
      />
    </View>
  );
});
