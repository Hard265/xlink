import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import { observer } from 'mobx-react';
import { Button, FlatList, Pressable, Text, View } from 'react-native';

import store, { User } from '../../store/store';

export default observer(() => {
  const db = useSQLiteContext();

  const onadduser = () => {
    store.addUser(
      db,
      User.fromJson({
        address: '0x12',
        displayName: 'Name',
        publicKey: '0x1234567890',
      }),
    );
  };

  const onnavigate = ({ address, displayName }: { address: string; displayName: string }) => {
    //@ts-ignore
    router.push(`/(app)/chat?address=${address}&displayName=${displayName}`);
  };

  return (
    <View>
      <Button title="add user" onPress={onadduser} />
      <FlatList
        data={store.users}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onnavigate({ address: item.address, displayName: item.displayName })}>
            <Text>{item.address}</Text>
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
