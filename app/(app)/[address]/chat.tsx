import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as crypto from 'expo-crypto';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, Text, SectionList } from 'react-native';

import { useSession } from '../../../providers/SessionProvider';
import store, { Message, User } from '../../../store/store';
import { sortedArrayString } from '../../../utilities';

export default observer(() => {
  const { address, publicKey } = useLocalSearchParams<{
    // This object represents the address and publicKey variables
    address: string;
    publicKey: string;
  }>();
  // This object represents the database context
  const db = useSQLiteContext();
  // This object represents the current session
  const { session } = useSession();

  // This object represents the content state
  const [content, setContent] = useState('');

  // This function returns the user object, given the address
  const user: User | null = _.find(store.users, ['address', address]) || null;

  // This function initializes the user, if they don't exist
  useEffect(() => {
    // Check if the user exists
    if (!_.find(store.users, ['address', address])) {
      // If not, initialize the user
      store.initializeUser(db, address as string);
    }
  }, [address]);

  // This variable represents the sorted array of strings
  const chat_id = sortedArrayString([session?.address as string, address as string]);

  // This variable represents the sectioned messages, given the chat_id
  const sectionedMessages = _.chain(store.messages)
    // Filter the messages by the chat_id
    .filter((m) => m.chatId === chat_id)
    // Order the messages by the timestamp, in descending order
    .orderBy((m) => new Date(m.timestamp).getTime(), 'desc')
    // Group the messages by the day
    .groupBy((message) => dayjs(message.timestamp).format('YYYY-MM-DD'))
    // Map the messages to an object, with a title and data
    .map((messages, key) => ({ title: key, data: messages }))
    // Return the mapped object
    .value();

  // This function represents the onsend event
  const onsend = () => {
    // Add the message to the store
    store.addMessage(db, session?.address as string, address as string, content);
    // Set the content to an empty string
    setContent('');
  };

  // This function represents the onsave event
  const onsave = () => {
    // Add the user to the store
    store.addUser(
      db,
      User.fromJson({ address: address as string, displayName: 'Unknown', publicKey }),
    );
  };
  return (
    <View className="flex-1 items-center justify-center">
      <SectionList
        className="flex-1 w-full"
        // If the user is not logged in, render the ListFooterComponent, otherwise render nothing
        ListFooterComponent={!user ? <ListFooterComponent onsave={onsave} /> : null}
        // Pass the sectionedMessages array to the SectionList component
        sections={sectionedMessages}
        // Generate a key for each item in the list
        keyExtractor={(item) => item.id}
        // Pass the ItemRenderer function to the SectionList component
        renderItem={ItemRenderer}
        // Pass the SectionFooterRenderer function to the SectionList component
        renderSectionFooter={SectionFooterRenderer}
        // Render the list in reverse order
        inverted
      />
      <View className="flex flex-row gap-x-2 p-2">
        <TextInput
          // Set the value of the input field to the content
          value={content}
          // Update the content when the input field value changes
          onChangeText={setContent}
          // Set the placeholder text of the input field
          placeholder="Type your message here..."
          className="flex-1  border-gray-300 px-4 py-2 rounded-xl bg-slate-200"
        />
        <Pressable
          // Send the message when the pressable component is pressed
          onPress={onsend}
          className="flex items-center justify-between rounded-xl bg-slate-800 p-3">
          <Text className="text-slate-50">
            <Feather name="arrow-up" size={24} />
          </Text>
        </Pressable>
      </View>
      <Stack.Screen
        // Set the title of the screen based on whether the user is logged in or not
        options={{
          title: user ? user.displayName : address,
          //@ts-ignore
          headerRight(props) {
            return <Feather name="user" size={24} color={props.tintColor} />;
          },
        }}
      />
    </View>
  );
});

const ItemRenderer = ({ item }: { item: Message }) => {
  const { session } = useSession();

  // Render message based on sender
  if (item.sender === session?.address) {
    return (
      <Pressable className="flex items-end justify-center w-full p-2 py-0.5">
        <View className="p-4 px-4.5 bg-slate-200 rounded-lg mb-2">
          <Text>{item.content}</Text>
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable className="flex items-start justify-center">
      <View className="p-3 bg-slate-200 rounded-lg mb-2">
        <Text>{item.content}</Text>
      </View>
    </Pressable>
  );
};

const SectionFooterRenderer = ({ section }: { section: { title: string; data: Message[] } }) => (
  <View className="flex-row justify-center items-center p-2">
    <Text className="text-slate-500">{section.title}</Text>
  </View>
);

interface ListFooterComponentProps {
  onsave: () => void;
}

const ListFooterComponent = ({ onsave }: ListFooterComponentProps) => (
  <View className="w-full flex-row justify-center items-center p-4 bg-slate-200">
    <Text className="text-slate-950">
      <Feather name="user-plus" size={24} />
    </Text>
    <View className="flex-1">
      <Text className="text-slate-950">This address is not in your contacts.</Text>
      <View className="flex-row justify-between items-center p-2 gap-x-4">
        <Pressable onPress={onsave} className="flex-1 p-2.5 bg-slate-950 rounded">
          <Text className="text-slate-50 font-medium">Add to contacts</Text>
        </Pressable>
      </View>
    </View>
  </View>
);
