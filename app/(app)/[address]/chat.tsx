import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Stack, router, useGlobalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { createRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  SectionList,
  DefaultSectionT,
  SectionListData,
} from 'react-native';

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
  const scrollRef = createRef<SectionList>();

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
    .orderBy((message) => new Date(message.timestamp).getTime(), 'desc')
    .groupBy((message) => dayjs(message.timestamp).format('dddd, MMM DD'))
    .map((messages, key) => ({ title: key, data: messages }))
    .value();

  const onsend = () => {
    store.addMessage(db, session, user || { address, publicKey }, content);
    setContent('');
    // scrollRef.current?.scrollToLocation({ animated: false, sectionIndex: 0, itemIndex: 0 });
  };

  const onsave = () => {
    store.addUser(db, { address: address as string, publicKey });
  };

  return (
    <View className="flex-1 items-center justify-center">
      <SectionList
        ref={scrollRef}
        className="flex-1 w-full"
        ListFooterComponent={!user ? <ListFooterComponent onsave={onsave} /> : null}
        sections={sectionedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => (
          <ItemRenderer item={item} index={index} section={section} />
        )}
        renderSectionFooter={({ section }) => (
          <View className="flex-row justify-center items-center p-2.5">
            <Text className="text-slate-600 text-xs font-medium">
              {dayjs(_.last(section.data)?.timestamp).format('dddd, MMM DD')} &bull;{' '}
              {dayjs(_.last(section.data)?.timestamp).format('h:mm A')}
            </Text>
          </View>
        )}
        inverted
      />
      <View className="flex flex-row gap-x-2 p-2">
        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={1}
          placeholder="Type your message here..."
          className="flex-1  border-gray-300 px-4 py-2 rounded-3xl bg-white shadow"
        />
        <Pressable
          onPress={onsend}
          className="flex items-center justify-between self-end rounded-full bg-slate-800 p-3">
          <Text className="text-slate-50">
            <Feather name="arrow-up" size={24} />
          </Text>
        </Pressable>
      </View>
      <Stack.Screen
        options={{
          title: address,
          headerShadowVisible: true,
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

const ItemRenderer = ({
  item,
  index,
  section,
}: {
  item: Message;
  index: number;
  section: SectionListData<Message, DefaultSectionT>;
}) => {
  const { session } = useSession();
  const [showOverline, setShowOverline] = useState(false);
  const onpress = () => {
    setShowOverline(!showOverline);
  };

  let borderRadiusClassName = computedBorderRadiusSender(section, index);
  const timestamp = (
    <Text className="text-xs text-slate-500 pr-3">{dayjs(item.timestamp).format('h:mm A')}</Text>
  );

  if (item.sender === session?.address) {
    return (
      <Pressable onPress={onpress} className="flex items-end justify-center w-full px-2 pb-0.5">
        <View
          className={`max-w-[85%] p-3 px-4 bg-white rounded-3xl shadow ${borderRadiusClassName}`}>
          <Text className="text-base">{item.content}</Text>
        </View>
        {showOverline && timestamp}
      </Pressable>
    );
  }

  borderRadiusClassName = computedBorderRadiusReciever(section, index);
  return (
    <Pressable onPress={onpress} className="flex items-start justify-center">
      <View className={`p-3 bg-slate-200 rounded-2xl mb-2 ${borderRadiusClassName}`}>
        <Text>{item.content}</Text>
      </View>
      {showOverline && timestamp}
    </Pressable>
  );
};

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
function computedBorderRadiusReciever(
  section: SectionListData<Message, DefaultSectionT>,
  index: number,
) {
  return _.compact([
    _.isEqual(section.data[index].receiver, section.data[index - 1]?.receiver) && 'rounded-bl',
    _.isEqual(section.data[index].receiver, section.data[index + 1]?.receiver) && 'rounded-tl',
  ]).join(' ');
}

function computedBorderRadiusSender(
  section: SectionListData<Message, DefaultSectionT>,
  index: number,
) {
  return _.compact([
    _.isEqual(section.data[index].sender, section.data[index - 1]?.sender) && 'rounded-br',
    _.isEqual(section.data[index].sender, section.data[index + 1]?.sender) && 'rounded-tr',
  ]).join(' ');
}
