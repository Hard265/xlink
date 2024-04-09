import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Link, Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

import styles from '../../misc/styles';
import { useSession } from '../../providers/SessionProvider';
import { useSocket } from '../../providers/SocketProvider';
import store from '../../store/store';

export default observer(() => {
  const { session } = useSession();
  const db = useSQLiteContext();
  const { connected } = useSocket();

  useEffect(() => {
    (async () => {})();
    store.loadRecents(db);
  }, [session, connected]);

  const data = _.chain(store.messages)
    .clone()
    .orderBy(
      ({ timestamp }) => {
        return new Date(timestamp).getTime();
      },
      ['desc'],
    )
    .uniqBy((message) => {
      return session?.address === message.sender ? message.receiver : message.sender;
    })
    .value();

  const onuser = () => router.push('/(app)/profile');

  return (
    <View className="items-center justify-center flex-1 dark:bg-black">
      <View className="bg-white">
        <Text className="dark:text-white">is connected: {connected ? 'true' : 'false'}</Text>
      </View>
      <FlatList
        data={data}
        contentContainerStyle={{ alignItems: 'center', height: '100%' }}
        className="w-full bg-white dark:bg-black"
        ListEmptyComponent={<ListEmptyComponent />}
        ListHeaderComponent={<Text className="font-medium" />}
        renderItem={({ item }) => {
          const address = item.sender === session?.address ? item.receiver : item.sender;
          const user = _.find(store.users, address);
          const onpress = () => {
            router.push(`/(app)/${address}/chat?displayName=${user?.address}`);
          };

          return (
            <TouchableOpacity
              className="w-full flex flex-row gap-x-2 px-2 py-0.5 items-start"
              onPress={onpress}>
              <View className="rounded-full bg-gray-200 dark:bg-gray-600 h-12 w-12 items-center justify-center">
                <Text className="text-xl uppercase">{address.substring(0, 1)}</Text>
              </View>
              <View className="flex-1 flex flex-col self-center">
                <View className="flex flex-row justify-between items-center">
                  <Text style={[styles.fontFace.InterMedium]} className="dark:text-white ">
                    {address}
                  </Text>
                </View>
                <Text
                  style={[styles.fontFace.InterRegular]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  className="dark:text-gray-300 flex-2">
                  {item.content} &bull;{' '}
                  <Text style={[styles.fontFace.InterMedium]} className="text-xs">
                    {dayjs(item.timestamp).format('h:mm A')}&nbsp;
                    {item.state === 'PENDING' && <Feather name="clock" size={14} />}
                    {item.state === 'SENT' && <Feather name="check" size={14} />}
                    {item.state === 'FAILED' && <Feather name="x-circle" size={14} />}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      <Link
        className="absolute bottom-2 right-2 p-5 bg-black dark:bg-white rounded-3xl"
        href="/(app)/users">
        <Text className="text-white dark:text-black">
          <Feather name="edit-3" size={20} />
        </Text>
      </Link>
      <Stack.Screen
        options={{
          title: 'Xlink',

          headerTitleStyle: styles.fontFace.PacificoRegular,
          //@ts-ignore
          headerRight(props) {
            return <Feather onPress={onuser} name="user" size={24} color={props.tintColor} />;
          },
        }}
      />
    </View>
  );
});
const ListEmptyComponent = () => {
  return (
    <View className="my-auto">
      <Text>No recent chats</Text>
    </View>
  );
};
