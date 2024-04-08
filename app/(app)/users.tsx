import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { createUser, generateKeyPair } from '../../encryption/key';
import { useSession } from '../../providers/SessionProvider';
import store from '../../store/store';

export default observer(() => {
  const db = useSQLiteContext();
  const { session } = useSession();

  const users = _.filter(store.users, (user) => user.address !== session?.address);

  const onscan = () => {
    const _user = createUser(generateKeyPair());
    store.addUser(db, {
      address: _user.address,
      publicKey: _user.publicKey,
    });
  };
  return (
    <View className="flex-1 p-2">
      <FlatList
        ListHeaderComponent={
          <Pressable
            onPress={onscan}
            className="flex w-full justify-center rounded-md bg-slate-300 px-3 py-2.5">
            <Text className="text-sm font-semibold leading-6 text-slate-950 text-center">
              scan address
            </Text>
          </Pressable>
        }
        data={users}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.replace(`/(app)/${item.address}/chat`)}
            className="w-full py-1 flex flex-row gap-x-2 items-center">
            <View className="p-2 px-4 rounded-full bg-gray-200">
              <Text className="text-xl uppercase">{item.address.substring(0, 1)}</Text>
            </View>
            <View className="flex-1 flex flex-col items-start">
              <Text>{item.address}</Text>
            </View>
          </Pressable>
        )}
      />
      <Stack.Screen
        options={{
          headerTitleAlign: 'center',
          headerRight(props) {
            return <Feather name="rotate-ccw" size={24} color={props.tintColor} />;
          },
        }}
      />
    </View>
  );
});
