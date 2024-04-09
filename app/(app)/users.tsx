import { Feather } from '@expo/vector-icons';
import { BarCodeScanningResult } from 'expo-camera/build/Camera.types';
import { CameraView } from 'expo-camera/next';
import { Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import styles from '../../misc/styles';
import { useSession } from '../../providers/SessionProvider';
import store from '../../store/store';

export default observer(() => {
  const db = useSQLiteContext();
  const { session } = useSession();
  const [scanning, setScanning] = useState(false);

  const onqrscan = (scanningResult: BarCodeScanningResult) => {
    const url = new URL(scanningResult.data);
    router.replace(
      `/(app)/${url.pathname.replace(/^\/+|\/+$/g, '')}/chat?publicKey=${url.searchParams.get('pub')}`,
    );
  };
  const users = _.filter(store.users, (user) => user.address !== session?.address);

  return (
    <View className="flex-1 p-2 dark:bg-black">
      <FlatList
        ListHeaderComponent={
          <Pressable
            onPress={() => setScanning(true)}
            className="flex w-full justify-center rounded-md bg-gray-300 dark:bg-gray-800 p-2">
            <Text className="text-sm font-medium leading-6 dark:text-white text-center">
              scan address
            </Text>
          </Pressable>
        }
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.replace(`/(app)/${item.address}/chat`)}
            className="w-full py-1 flex flex-row gap-x-2 items-center">
            <View className="p-2 px-4 rounded-full bg-gray-200">
              <Text className="text-xl uppercase">{item.address.substring(0, 1)}</Text>
            </View>
            <View className="flex-1 flex flex-col items-start">
              <Text style={[styles.fontFace.InterMedium]} className="dark:text-white">
                {item.address}
              </Text>
            </View>
          </TouchableOpacity>
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
