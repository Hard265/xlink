import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import List from '../../components/List';
import Text from '../../components/Text';
import { useSession } from '../../providers/SessionProvider';
import configurations from '../../store/configurations';

export default observer(() => {
  const { session, signOut } = useSession();

  const [deletePrompt, setDeletePrompt] = useState(false);

  if (!session) {
    return null;
  }

  const onsignout = () => {
    signOut();
  };

  const ondelete = () => {
    signOut();
  };

  const url = new URL('xln://xlink.io');
  url.pathname = session.address;
  url.searchParams.set('pub', session.publicKey);

  return (
    <View className="flex flex-1 dark:bg-black">
      <ScrollView className="flex-1">
        <View className="w-full p-2 flex flex-row shadow">
          <View className="p-4 bg-white">
            <QRCode value={url.toString()} size={128} />
          </View>
          <Text className="text-base px-2 flex-1 dark:text-white">{session.address}</Text>
        </View>
        <View className="p-2">
          <List.Title>Settings</List.Title>
          <List.CardList>
            <List.CardList.Item title="theme" append={configurations.config.theme} />
            <List.CardList.SwitchItem
              onChange={(value) => configurations.update('notifications', value)}
              value={configurations.config.notifications}
              title="Notifications"
            />
            <List.CardList.SwitchItem
              onChange={(value) => configurations.update('webLinkPreview', value)}
              value={configurations.config.webLinkPreview}
              title="Web link preview"
            />
          </List.CardList>
        </View>
        <View className="p-2">
          <List.Title>Privancy</List.Title>
          <List.CardList>
            <List.CardList.SwitchItem
              onChange={(value) => configurations.update('deliveryReports', value)}
              value={configurations.config.deliveryReports}
              title="Send delivery reports"
            />
            <List.CardList.Item
              title="Message Retention Period"
              append={
                configurations.config.retentionPeriod === 0 ? 'immediate' : configurations.config.retentionPeriod + ''
              }
            />
            <List.CardList.SwitchItem
              onChange={(value) => configurations.update('blockUnknown', value)}
              value={configurations.config.blockUnknown}
              title="block unsaved addresses"
            />
            <List.CardList.Item title="Blocked messages" append={<Feather name="chevron-right" size={24} />} />

            <List.CardList.SwitchItem
              onChange={(value) => configurations.update('enableBiometric', value)}
              value={configurations.config.enableBiometric}
              title="Biometric Authentication"
            />
          </List.CardList>
        </View>
      </ScrollView>
      <View className="w-full p-4 pt-1 mt-auto">
        <Pressable
          className="flex items-center bg-red-600 border border-red-500 p-2.5 w-full rounded-xl"
          onPress={onsignout}>
          <Text className="text-red-200">Remove address from device</Text>
        </Pressable>
      </View>

      <Modal visible={deletePrompt} transparent onRequestClose={() => setDeletePrompt(false)} animationType="fade">
        <View className="mx-4 my-auto">
          <View className="border border-slate-300 bg-slate-200 p-4 rounded-lg">
            <Text className="text-slate-600">
              Are you sure you want to remove the address from the device? The only to recover the address is throught
              the mnemonic seed.
            </Text>
            <View className="flex flex-row gap-x-2">
              <Pressable className="" onPress={() => setDeletePrompt(false)}>
                <Text className="text-slate-600">Cancel</Text>
              </Pressable>
              <Pressable className="bg-red-600 border border-red-700 p-2.5 w-full mt-4 p-2.5" onPress={ondelete}>
                <Text className="text-red-200">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Stack.Screen options={{ title: 'Me', headerShadowVisible: false }} />
    </View>
  );
});
//5854
