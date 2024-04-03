import { Feather } from '@expo/vector-icons';
import { Link, Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';

import { useSession } from '../../providers/SessionProvider';
import store from '../../store/store';

export default observer(() => {
  const { session } = useSession();
  const db = useSQLiteContext();

  useEffect(() => {
    store.initializeUsers(db);
    store.initializeRecents(db);
  }, [session]);

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
    <View className="items-center justify-center flex-1">
      <FlatList
        data={data}
        className="w-full bg-white"
        ListEmptyComponent={<ListEmptyComponent />}
        ListHeaderComponent={<Text className="font-medium" />}
        renderItem={({ item }) => {
          const address = item.sender === session?.address ? item.receiver : item.sender;
          const user = _.find(store.users, address);
          const onpress = () => {
            router.push(`/(app)/${address}/chat?displayName=${user?.address}`);
          };

          return (
            <Pressable className="flex flex-row gap-x-2 px-2 py-0.5" onPress={onpress}>
              <View className="rounded-full bg-slate-200 p-6" />
              <View className="flex-1 flex flex-col">
                <View className="flex flex-row justify-between items-center">
                  <Text>{user ? user.displayName : address}</Text>
                </View>
                <View>
                  <Text>{item.content}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      <Link className="absolute bottom-2 right-2 p-4 bg-slate-950 rounded-xl" href="/(app)/users">
        <Text className="text-gray-50">
          <Feather name="users" size={24} />
        </Text>
      </Link>
      <Stack.Screen
        options={{
          title: '',
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
    <View>
      <Text>No recent chats</Text>
    </View>
  );
};
