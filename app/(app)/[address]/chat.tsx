import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as crypto from 'expo-crypto';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, Text, SectionList } from 'react-native';

import { useSession } from '../../../providers/SessionProvider';
import store, { Message, User } from '../../../store/store';
import { sortedArrayString } from '../../../utilities';

export default observer(() => {
  const { address } = useLocalSearchParams();
  const db = useSQLiteContext();
  const { session } = useSession();

  const [showSave, setShowSave] = useState(true);
  const [messageText, setMessageText] = useState('');

  const user: User | null = _.find(store.users, ['address', address]) || null;

  useEffect(() => {
    function setup() {
      if (!_.find(store.users, ['address', address])) {
        store.initializeUser(db, address as string);
      }
    }
    setup();
  }, [address]);

  const chat_id = sortedArrayString([session?.address as string, address as string]);
  const display_save_address_modal: boolean = showSave && !user;

  const sectionedMessages = _.chain(store.messages)
    .filter(['chatId', chat_id])
    .groupBy((message) => dayjs(message.timestamp).format('YYYY-MM-DD'))
    .map((messages, key) => ({ title: key, data: messages }))
    .value();

  const onsend = () => {
    store.addMessage(
      db,
      Message.fromJson({
        id: crypto.randomUUID(),
        chatId: chat_id,
        content: messageText,
        receiver: address as string,
        sender: session?.address as string,
        timestamp: dayjs().toISOString(),
      }),
    );
    setMessageText('');
  };

  const onsave = () => {
    store.addUser(
      db,
      User.fromJson({ address: address as string, displayName: '00', publicKey: '00' }),
    );
  };
  return (
    <View className="flex-1 items-center justify-center">
      <View className="flex-1 p-1.5">
        <SectionList
          ListFooterComponent={
            display_save_address_modal ? (
              <ListFooterComponent ondimiss={() => setShowSave(false)} onsave={onsave} />
            ) : null
          }
          sections={sectionedMessages}
          keyExtractor={(item) => item.id}
          renderItem={ItemRenderer}
          renderSectionFooter={SectionFooterRenderer}
          inverted
        />
      </View>
      <View className="flex flex-row gap-x-2 p-2">
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type your message here..."
          className="border border-gray-300 px-4 py-2 rounded-xl bg-slate-200"
        />
        <Pressable
          onPress={onsend}
          className="flex items-center justify-between rounded-xl bg-slate-500 p-2 mt-2">
          <Text className="text-slate-50">
            <Feather name="arrow-up" size={20} />
          </Text>
        </Pressable>
      </View>
      <Stack.Screen
        options={{
          //@ts-ignore
          headerRight(props) {
            return <Feather name="user" size={24} color={props.tintColor} />;
          },
        }}
      />
    </View>
  );
});

const ItemRenderer = ({ item }: { item: Message }) => {
  const { session } = useSession();

  // Render message based on sender
  if (item.sender === session?.address) {
    return (
      <Pressable className="flex items-end justify-center">
        <View className="p-3 bg-slate-200 rounded-lg mb-2">
          <Text>{item.content}</Text>
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable className="flex items-start justify-center">
      <View className="p-3 bg-slate-200 rounded-lg mb-2">
        <Text>{item.content}</Text>
      </View>
    </Pressable>
  );
};

const SectionFooterRenderer = ({ section }: { section: { title: string; data: Message[] } }) => (
  <View className="flex-row justify-between items-center p-2">
    <Text className="text-slate-500">{section.title}</Text>
  </View>
);

interface ListFooterComponentProps {
  ondimiss: () => void;
  onsave: () => void;
}

const ListFooterComponent = ({ ondimiss, onsave }: ListFooterComponentProps) => (
  <View className="w-full flex-row justify-center items-center p-4 bg-slate-200">
    <Text className="text-slate-950">
      <Feather name="user-plus" size={24} />
    </Text>
    <View className="flex-1">
      <Text className="text-slate-950">This address is not in your contacts.</Text>
      <View className="flex-row justify-between items-center p-2 gap-x-4">
        <Pressable onPress={ondimiss} className="border border-slate-500 flex-1 p-2.5 rounded">
          <Text className="text-slate-950 font-medium">Dismiss</Text>
        </Pressable>
        <Pressable onPress={onsave} className="flex-1 p-2.5 bg-slate-950 rounded">
          <Text className="text-slate-50 font-medium">Add to contacts</Text>
        </Pressable>
      </View>
    </View>
  </View>
);
