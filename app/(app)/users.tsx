import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useSession } from '../../providers/SessionProvider';
import store from '../../store/store';

export default observer(() => {
  const db = useSQLiteContext();
  const { session } = useSession();

  const setup = () => {
    store.initializeUsers(db);
  };

  useEffect(() => {
    setup();
  }, []);

  const onnavigate = ({ address, displayName }: { address: string; displayName: string }) => {
    router.push(`/(app)/${address}/chat?displayName=${displayName}`);
  };

  const users = _.filter(store.users, (user) => user.address !== session?.address);

  return (
    <View className="flex-1 p-2">
      <FlatList
        ListHeaderComponent={
          <Pressable className="flex w-full justify-center rounded-md bg-slate-300 px-3 py-2.5">
            <Text className="text-sm font-semibold leading-6 text-slate-950 text-center">
              scan address
            </Text>
          </Pressable>
        }
        data={users}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onnavigate({ address: item.address, displayName: item.displayName })}
            className="w-full py-1 flex flex-row gap-x-2 items-center">
            <View className="p-6 rounded-full bg-gray-200" />
            <View className="flex-1 flex flex-col items-start">
              <Text>{item.displayName}</Text>
              <Text>{item.address}</Text>
            </View>
          </Pressable>
        )}
      />
      <Stack.Screen
        options={{
          headerTitleAlign: 'center',
          headerRight(props) {
            return <Feather onPress={setup} name="rotate-ccw" size={24} color={props.tintColor} />;
          },
        }}
      />
    </View>
  );
});
