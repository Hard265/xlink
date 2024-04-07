import { Stack, router, useGlobalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { Pressable, View, Text, Modal } from 'react-native';

import store from '../../../store/store';

export default observer(() => {
  const { address } = useGlobalSearchParams<{ address: string }>();
  const db = useSQLiteContext();

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const user = _.find(store.users, { address });

  const ondelete = () => {
    store.deleteUser(db, address).then(() => {
      router.replace('/(app)/');
    });
  };

  return (
    <View className="flex flex-col items-center justify-center h-full w-full p-2">
      {/**user delete button + prompt */}
      <Pressable
        className="flex items-center bg-red-600 border border-red-700 p-2 w-full rounded-xl mt-auto"
        onPress={() => setModalVisible(true)}>
        <Text className="text-red-200 font-medium">Delete {address}</Text>
      </Pressable>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        supportedOrientations={['portrait', 'portrait-upside-down']}
        animationType="fade">
        <View className="mx-4 my-auto">
          <View className="border border-slate-300 bg-slate-200 p-4 rounded-lg">
            <Text className="text-slate-600">Are you sure you want to delete {address}?</Text>
            <View className="flex flex-row gap-x-2">
              <Pressable className="flex-1" onPress={() => setModalVisible(false)}>
                <Text className="text-slate-600">Cancel</Text>
              </Pressable>
              <Pressable
                className="bg-red-600 border border-red-700 p-2 rounded-xl flex-1 mt-4"
                onPress={ondelete}>
                <Text className="text-red-200 font-medium">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Stack.Screen
        options={{
          title: address,
        }}
      />
    </View>
  );
});
