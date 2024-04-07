import dayjs from 'dayjs';
import { useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import React from 'react';
import { Button, SectionList, Text, View } from 'react-native';

import { useSession } from '../providers/SessionProvider';
import { Message, User } from '../store/__store';

interface ChatMessagesListProps {
  messages: Message[];
  user: User | null;
}

export default function ChatMessagesList({ user, messages }: ChatMessagesListProps) {
  const { address } = useLocalSearchParams();
  const { session } = useSession();

  React.useEffect(() => {}, [address]);

  const groupedMessages = _.chain(messages)
    .clone()
    .groupBy((message) => dayjs(message.timestamp).format('YYYY-MM-DD'))
    .mapValues((messages, key) => ({ title: key, data: messages }))
    .orderBy((item) => dayjs(item.title).toDate().getTime(), 'desc')
    .value();

  // message bubble
  const renderItem = ({ item }: { item: Message }) => {
    if (item.sender === session?.address) {
      return (
        <View>
          <Text>{item.content}</Text>
        </View>
      );
    }
    return (
      <View>
        <Text>{item.content}</Text>
      </View>
    );
  };

  // timestamp for message group
  const renderSectionFooter = ({ section: { title } }: any) => (
    <View>
      <Text>{title}</Text>
    </View>
  );

  // add user to contacts prompt
  const ListFooterComponent = () => (
    <View>
      <Text>This address is not in your contacts. Save contact?</Text>
      <View>
        <Button title="dismiss" />
        <Button title="confirm" />
      </View>
    </View>
  );

  return (
    <SectionList
      ListFooterComponent={!user ? ListFooterComponent : null}
      sections={groupedMessages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionFooter={renderSectionFooter}
      inverted
    />
  );
}
