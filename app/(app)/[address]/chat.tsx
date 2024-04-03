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
  const { address, publicKey } = useLocalSearchParams<{
    address: string;
    publicKey: string;
  }>();
  const db = useSQLiteContext();
  const { session } = useSession();

  const [content, setContent] = useState('');

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

  const sectionedMessages = _.chain(store.messages)
    .filter((m) => m.chatId === chat_id)
    .orderBy((m) => new Date(m.timestamp).getTime(), 'desc')
    .groupBy((message) => dayjs(message.timestamp).format('YYYY-MM-DD'))
    .map((messages, key) => ({ title: key, data: messages }))
    .value();

  const onsend = () => {
    store.addMessage(
      db,
      Message.fromJson({
        id: crypto.randomUUID(),
        chatId: chat_id,
        content,
        receiver: address as string,
        sender: session?.address as string,
        timestamp: dayjs().toISOString(),
      }),
    );
    setContent('');
  };

  const onsave = () => {
    store.addUser(
      db,
      User.fromJson({ address: address as string, displayName: 'Unknown', publicKey }),
    );
  };
  return (
    <View className="flex-1 items-center justify-center">
      <SectionList
        className="flex-1 w-full"
        ListFooterComponent={!user ? <ListFooterComponent onsave={onsave} /> : null}
        sections={sectionedMessages}
        keyExtractor={(item) => item.id}
        renderItem={ItemRenderer}
        renderSectionFooter={SectionFooterRenderer}
        inverted
      />
      <View className="flex flex-row gap-x-2 p-2">
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Type your message here..."
          className="flex-1  border-gray-300 px-4 py-2 rounded-xl bg-slate-200"
        />
        <Pressable
          onPress={onsend}
          className="flex items-center justify-between rounded-xl bg-slate-800 p-3">
          <Text className="text-slate-50">
            <Feather name="arrow-up" size={24} />
          </Text>
        </Pressable>
      </View>
      <Stack.Screen
        options={{
          title: user ? user.displayName : address,
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
      <Pressable className="flex items-end justify-center w-full p-2 py-0.5">
        <View className="p-4 px-4.5 bg-slate-200 rounded-lg mb-2">
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
  <View className="flex-row justify-center items-center p-2">
    <Text className="text-slate-500">{section.title}</Text>
  </View>
);

interface ListFooterComponentProps {
  onsave: () => void;
}

const ListFooterComponent = ({ onsave }: ListFooterComponentProps) => (
  <View className="w-full flex-row justify-center items-center p-4 bg-slate-200">
    <Text className="text-slate-950">
      <Feather name="user-plus" size={24} />
    </Text>
    <View className="flex-1">
      <Text className="text-slate-950">This address is not in your contacts.</Text>
      <View className="flex-row justify-between items-center p-2 gap-x-4">
        <Pressable onPress={onsave} className="flex-1 p-2.5 bg-slate-950 rounded">
          <Text className="text-slate-50 font-medium">Add to contacts</Text>
        </Pressable>
      </View>
    </View>
  </View>
);
