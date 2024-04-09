import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import calender from 'dayjs/plugin/calendar';
import { Stack, router, useGlobalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import { StatusBar } from 'expo-status-bar';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { createRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  SectionList,
  DefaultSectionT,
  SectionListData,
  Pressable,
} from 'react-native';
import { Socket } from 'socket.io-client';

import styles from '../../../misc/styles';
import { useSession } from '../../../providers/SessionProvider';
import { useSocket } from '../../../providers/SocketProvider';
import store, { Message, User } from '../../../store/store';
import { getRandomId, isoStringToCalender, sortedArrayString } from '../../../utilities';

export default observer(() => {
  const { address, publicKey } = useGlobalSearchParams<{
    address: string;
    publicKey: string;
  }>();
  const db = useSQLiteContext();
  const { session } = useSession();
  const { socket } = useSocket();
  const [content, setContent] = useState('');
  const scrollRef = createRef<SectionList>();

  dayjs.extend(calender);

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

  const grouped = _.chain(store.messages)
    .filter((message) => message.chatId === chat_id)
    .orderBy((message) => new Date(message.timestamp).getTime(), 'desc')
    .groupBy((message) => dayjs(message.timestamp).format('dddd, MMM DD'))
    .map((messages, key) => ({ title: key, data: messages }))
    .value();

  const handle_submit = () => {
    const message: Message = {
      id: getRandomId(),
      chatId: chat_id,
      sender: session.address,
      receiver: address,
      content,
      timestamp: new Date().toISOString(),
      state: 'PENDING',
    };
    store.send(db, socket as Socket, message);

    setContent('');
  };

  const handle_save = () => {
    store.addUser(db, { address: address as string, publicKey });
  };

  return (
    <View className="flex-1 items-center justify-center dark:bg-black">
      <SectionList
        ref={scrollRef}
        className="flex-1 w-full"
        ListFooterComponent={!user ? <ListFooterComponent onsave={handle_save} /> : null}
        sections={grouped}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => (
          <ItemRenderer item={item} index={index} section={section} />
        )}
        renderSectionFooter={({ section }) => (
          <View className="flex-row justify-center items-center p-2.5">
            <Text
              style={[styles.fontFace.InterMedium]}
              className="text-gray-600 dark:text-gray-200 text-xs">
              {isoStringToCalender(_.last(section.data)?.timestamp)}
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
          style={[styles.fontFace.InterMedium]}
          className="flex-1 px-4 py-2 rounded-3xl text-black dark:text-white bg-white dark:bg-gray-800 shadow border border-transparent focus:border-gray-400 dark:focus:border-gray-700"
        />
        <TouchableOpacity
          onPress={handle_submit}
          className="flex items-center justify-between self-end rounded-full bg-black dark:bg-white p-3">
          <Text className="text-white dark:text-black">
            <Feather name="arrow-up" size={24} />
          </Text>
        </TouchableOpacity>
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
    <Text
      style={[styles.fontFace.InterMedium]}
      className="text-xs text-gray-500 dark:text-gray-200 pr-3 justify-center">
      {dayjs(item.timestamp).format('h:mm A')}{' '}
      {item.state === 'PENDING' && <Feather name="clock" size={14} />}
      {item.state === 'SENT' && <Feather name="check" size={14} />}
      {item.state === 'FAILED' && <Feather name="x-circle" size={14} />}
    </Text>
  );

  if (item.sender === session?.address) {
    return (
      <Pressable onPress={onpress} className="flex items-end justify-center w-full px-2 pb-0.5">
        <View
          className={`max-w-[85%] p-3 px-4 bg-white dark:bg-gray-800 rounded-3xl shadow ${borderRadiusClassName}`}>
          <Text style={[styles.fontFace.InterMedium]} className="dark:text-white">
            {item.content}
          </Text>
        </View>
        {showOverline && timestamp}
      </Pressable>
    );
  }

  borderRadiusClassName = computedBorderRadiusReciever(section, index);
  return (
    <TouchableOpacity onPress={onpress} className="flex items-start justify-center">
      <View className={`p-3 bg-slate-200 rounded-2xl mb-2 ${borderRadiusClassName}`}>
        <Text>{item.content}</Text>
      </View>
      {showOverline && timestamp}
    </TouchableOpacity>
  );
};

interface ListFooterComponentProps {
  onsave: () => void;
}

const ListFooterComponent = ({ onsave }: ListFooterComponentProps) => (
  <View className="flex-row justify-center items-start gap-x-4 p-4 m-2 rounded-xl bg-white dark:bg-gray-800 shadow">
    <Text className="text-black dark:text-white">
      <Feather name="user-plus" size={28} />
    </Text>
    <View className="flex-1">
      <Text className="dark:text-white">This address is not in your contacts.</Text>
      <View className="flex-row justify-end items-center p-2 pt-4 pb-0 gap-x-4">
        <Text className="font-medium uppercase dark:text-white">Dismiss</Text>
        <TouchableOpacity
          onPress={onsave}
          className="flex-1 items-center p-2 bg-gray-200 dark:bg-gray-950 rounded-xl">
          <Text className="font-medium uppercase dark:text-white">save</Text>
        </TouchableOpacity>
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
