import { Feather } from '@expo/vector-icons';
import { observer } from 'mobx-react';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useSession } from '../../providers/SessionProvider';
import { copyToClipboard } from '../../utilities';

export default observer(() => {
  const { session, signOut } = useSession();

  const [deletePrompt, setDeletePrompt] = React.useState(false);

  const onsignout = () => {
    signOut();
  };

  const copyaddress = () => {
    copyToClipboard(session?.address as string);
  };

  const qrvalue = JSON.stringify({ address: session?.address, publicKey: session?.publicKey });

  const ondelete = () => {
    signOut();
  };
  return (
    <View className="p-4 flex-1">
      <View className="flex flex-row items-end">
        <QRCode value={qrvalue} />
        <View className="ml-2">
          <Text className="font-semibold">{session?.displayName}</Text>
          <Text className="font-semibold">{session?.address}</Text>
          <Feather name="copy" size={20} onPress={copyaddress} />
        </View>
      </View>

      {/**delete account button and prompt */}
      <Pressable
        onPress={onsignout}
        className="flex w-full justify-center rounded-md px-3 py-2.5 mt-auto bg-red-600 border border-red-700">
        <Text className="text-sm font-semibold leading-6 text-red-200 text-center">
          remove address from device
        </Text>
      </Pressable>
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
    </View>
  );
});
