import { Feather } from '@expo/vector-icons';
import { observer } from 'mobx-react';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useSession } from '../../providers/SessionProvider';
import { copyToClipboard } from '../../utilities';

export default observer(() => {
  const { session, signOut } = useSession();

  const onsignout = () => {
    signOut();
  };

  const copyaddress = () => {
    copyToClipboard(session?.address as string);
  };

  const qrvalue = JSON.stringify({ address: session?.address, publicKey: session?.publicKey });
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
      <Pressable
        onPress={onsignout}
        className="flex w-full justify-center rounded-md px-3 py-2.5 mt-auto bg-red-600 border border-red-700">
        <Text className="text-sm font-semibold leading-6 text-red-200 text-center">
          remove address from device
        </Text>
      </Pressable>
    </View>
  );
});
