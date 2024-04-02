import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
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

  const onfab = () => {
    router.push('/(app)/users');
  };

  const onuser = () => router.push('/(app)/user');

  return (
    <View className="items-center justify-center flex-1">
      <FlatList
        data={data}
        renderItem={({ item }) => {
          const title = item.sender === session?.address ? item.receiver : item.sender;
          const onpress = () => {};

          return (
            <Pressable className="flex flex-row gap-x-2 px-2 py-0.5" onPress={onpress}>
              <View className="flex-1 flex flex-col">
                <View className="flex flex-row justify-between items-center">
                  <Text>{title}</Text>
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
      <Pressable onPress={onfab} className="absolute bottom-2 right-2 p-4 bg-slate-950 rounded-xl">
        <Text className="text-gray-50">
          <Feather name="users" size={20} />
        </Text>
      </Pressable>
      <Stack.Screen
        options={{
          //@ts-ignore
          headerRight(props) {
            return <Feather onPress={onuser} name="user" size={24} color={props.tintColor} />;
          },
        }}
      />
    </View>
  );
});
