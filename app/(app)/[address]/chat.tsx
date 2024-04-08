import { Feather } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import dayjs from 'dayjs';
import { PrivateKey } from 'eciesjs';
import { Stack, router, useGlobalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, Text, SectionList } from 'react-native';

// import { decrypt } from '../../../encryption/cryptography';
import { decrypt } from '../../../encryption/cryptography';
import { useSession } from '../../../providers/SessionProvider';
import store, { Message, User } from '../../../store/store';
import { sortedArrayString } from '../../../utilities';

export default observer(() => {
  const { address, publicKey } = useGlobalSearchParams<{
    address: string;
    publicKey: string;
  }>();
  const db = useSQLiteContext();
  const { session } = useSession();
  const [content, setContent] = useState('');

  if (!session) {
    return null;
  }

  const chat_id = sortedArrayString([session.address, address]);
  let user: User | null = _.find(store.users, ['address', address]) || null;

  useEffect(() => {
    (async () => {
      if (!user) {
        user = await db.getFirstAsync<User>('SELECT * FROM users WHERE address = ?', address);
      }
    })();
    store.loadChat(db, chat_id);
  }, [address]);

  const sectionedMessages = _.chain(store.messages)
    .filter((message) => message.chatId === chat_id)
    .map((message): Message => {
      return {
        ...message,
        // content: decrypt(session?.privateKey, message.content),
      };
    })
    .orderBy((message) => new Date(message.timestamp).getTime(), 'desc')
    .groupBy((message) => dayjs(message.timestamp).format('MMM DD, YYYY'))
    .map((messages, key) => ({ title: key, data: messages }))
    .value();

  const onsend = () => {
    store.addMessage(db, session, user || { address, publicKey }, content);
    setContent('');
  };

  const onsave = () => {
    store.addUser(db, { address: address as string, publicKey });
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
          className="flex-1  border-gray-300 px-4 py-2 rounded-full bg-slate-200"
        />
        <Pressable
          onPress={onsend}
          className="flex items-center justify-between rounded-full bg-slate-800 p-3">
          <Text className="text-slate-50">
            <Feather name="arrow-up" size={24} />
          </Text>
        </Pressable>
      </View>
      <Stack.Screen
        options={{
          title: address,

          headerRight(props) {
            return (
              <Feather
                onPress={() => router.push(`/(app)/${address}/user`)}
                name="user"
                size={24}
                color={props.tintColor}
              />
            );
          },
        }}
      />
    </View>
  );
});

const ItemRenderer = ({ item }: { item: Message }) => {
  const { session } = useSession();

  if (item.sender === session?.address) {
    return (
      <Pressable className="flex items-end justify-center w-full px-2 pb-0.5">
        <View className="max-w-[80%] p-4 px-4.5 bg-slate-200 rounded-2xl mb-2">
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
