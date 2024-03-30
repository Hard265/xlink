import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { View, Text, FlatList, Pressable, Button } from 'react-native';

import { useSession } from '../../providers/SessionProvider';
import store from '../../store/store';

export default observer(() => {
  const { session, signOut } = useSession();
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

  return (
    <View className="items-center justify-center flex-1">
      <Button title="sign out" onPress={() => signOut()} />
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
          <Feather name="users" size={24} />
        </Text>
      </Pressable>
      <Stack.Screen
        options={{
          headerRight(props) {
            return <Feather name="user" size={24} color={props.tintColor} />;
          },
        }}
      />
    </View>
  );
});
