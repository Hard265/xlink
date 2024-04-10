import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Link, Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';

import State from '../../components/State';
import Text from '../../components/Text';
import styles from '../../misc/styles';
import { useSession } from '../../providers/SessionProvider';
import { useSocket } from '../../providers/SocketProvider';
import store from '../../store/store';

export default observer(() => {
  const db = useSQLiteContext();
  const { session } = useSession();
  const { connected } = useSocket();

  useEffect(() => {
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
    <View className="items-center justify-center flex-1 bg-white dark:bg-black">
      {!connected ? (
        <Text className="text-red-600 dark:text-red-500 capitalize p-1">
          no internet connection
        </Text>
      ) : (
        <Text className="text-green-600 dark:text-green-500 capitalize p-1">connected</Text>
      )}
      <FlatList
        data={data}
        contentContainerStyle={{ alignItems: 'center', height: '100%' }}
        className="w-full bg-white dark:bg-black"
        ListEmptyComponent={<ListEmptyComponent />}
        ListHeaderComponent={<Text />}
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
                  <Text className="dark:text-white ">{address}</Text>
                </View>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  className="dark:text-gray-300 flex-2">
                  {item.content} &bull;{' '}
                  <Text className="text-xs">
                    {dayjs(item.timestamp).format('h:mm A')} <State message={item} />
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
          title: 'Xlink.',
          headerTitleStyle: styles.fontFace.PacificoRegular,
          headerRight(props) {
            return (
              <View className="flex flex-row gap-x-4">
                <Feather name="search" size={24} color={props.tintColor} />
                <Feather onPress={onuser} name="user" size={24} color={props.tintColor} />
              </View>
            );
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
