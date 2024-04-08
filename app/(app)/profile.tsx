import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { observer } from 'mobx-react';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useSession } from '../../providers/SessionProvider';
import { copyToClipboard } from '../../utilities';

export default observer(() => {
  const { session, signOut } = useSession();
  const [deletePrompt, setDeletePrompt] = React.useState(false);

  if (!session) {
    return null;
  }

  const onsignout = () => {
    signOut();
  };

  const copyaddress = () => {
    copyToClipboard(session?.address as string);
  };

  const ondelete = () => {
    signOut();
  };

  return (
    <View className="flex-1">
      <View className="bg-white w-full p-2 flex flex-row shadow">
        <QRCode value={session.address} size={128} />
        <Text className="text-base px-2 flex-1">{session.address}</Text>
      </View>
      <View className="w-full p-2 mt-auto">
        <Pressable
          className="flex items-center bg-red-600 border border-red-700 p-2 w-full rounded-lg"
          onPress={onsignout}>
          <Text className="text-red-200 font-medium">Remove address from device</Text>
        </Pressable>
      </View>
      <Modal
        visible={deletePrompt}
        transparent
        onRequestClose={() => setDeletePrompt(false)}
        animationType="fade">
        <View className="mx-4 my-auto">
          <View className="border border-slate-300 bg-slate-200 p-4 rounded-lg">
            <Text className="text-slate-600">
              Are you sure you want to remove the address from the device? The only to recover the
              address is throught the mnemonic seed.
            </Text>
            <View className="flex flex-row gap-x-2">
              <Pressable className="" onPress={() => setDeletePrompt(false)}>
                <Text className="text-slate-600">Cancel</Text>
              </Pressable>
              <Pressable
                className="bg-red-600 border border-red-700 p-2.5 w-full mt-4 p-2.5"
                onPress={ondelete}>
                <Text className="text-red-200 font-medium">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Stack.Screen options={{ title: 'Me', headerShadowVisible: false }} />
    </View>
  );
});
