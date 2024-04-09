import { Stack, router, useGlobalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { Pressable, View, Text, Modal, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import styles from '../../../misc/styles';
import store from '../../../store/store';

export default observer(() => {
  const { address } = useGlobalSearchParams<{ address: string }>();
  const db = useSQLiteContext();

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // const user = _.find(store.users, { address });

  const ondelete = () => {
    store.deleteUser(db, address).then(() => {
      router.replace('/(app)/');
    });
  };

  return (
    <View className="dark:bg-black flex flex-col items-center h-full w-full">
      <View className="bg-white dark:bg-black w-full p-2 flex flex-row shadow">
        <View className="p-4 bg-white">
          <QRCode value={address} size={128} />
        </View>
        <Text
          style={[styles.fontFace.InterMedium]}
          className="dark:text-white text-base px-2 flex-1">
          {address}
        </Text>
      </View>
      <View className="w-full p-2 mt-auto">
        <Pressable
          className="flex items-center bg-red-600 border border-red-700 p-2 w-full rounded-lg"
          onPress={() => setModalVisible(true)}>
          <Text className="text-red-200 font-medium">Delete {address}</Text>
        </Pressable>
      </View>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
        transparent
        animationType="fade">
        <Pressable
          onPress={() => setModalVisible(false)}
          className="bg-black/75 h-full w-full top-0 bottom-0 right-0 left-0 absolute"
        />
        <View className="mx-4 my-auto">
          <View className="bg-white p-4 rounded-lg">
            <Text className="">
              Are you sure you want to delete <Text className="font-medium">{address}</Text>?
            </Text>
            <View className="flex flex-row justify-end gap-x-6 p-3 pb-0">
              <Text className="uppercase font-medium" onPress={() => setModalVisible(false)}>
                Cancel
              </Text>
              <Text className="text-red-600 font-medium uppercase" onPress={ondelete}>
                Delete
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Stack.Screen
        options={{
          title: address,
          headerShadowVisible: false,
        }}
      />
    </View>
  );
});
