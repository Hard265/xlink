import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import { observer } from 'mobx-react';
import { Button, FlatList, Pressable, Text, View } from 'react-native';

import store, { User } from '../../store/store';

export default observer(() => {
  const db = useSQLiteContext();
  
  const setup = ()=>{
    store.initializeUsers(db);
  }
  
  useEffect(()=>{
    setup();
  },[]);

  const onnavigate = ({ address, displayName }: { address: string; displayName: string }) => {
    //@ts-ignore
    router.push(`/(app)/chat?address=${address}&displayName=${displayName}`);
  };

  return (
    <View className="flex-1 p-4">
      <FlatList
        ListHeaderComponent={
          <Pressable className="flex w-full justify-center rounded-md bg-slate-300 px-3 py-2.5">
            <Text className="text-sm font-semibold leading-6 text-slate-950 text-center">
              scan address
            </Text>
          </Pressable>
        }
        data={store.users}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onnavigate({ address: item.address, displayName: item.displayName })}
            className='w-full px-2 py-0.5 flex flex-row gap-x-2 items-center'
          >
            <View className="p-4 rounded-full bg-gray-200"/>
            <View class='flex-1 flex flex-col items-start'>
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
