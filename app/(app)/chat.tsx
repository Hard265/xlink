import dayjs from 'dayjs';
import * as crypto from 'expo-crypto';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button } from 'react-native';

import ChatMessagesList from '../../components/ChatMessagesList';
import { useSession } from '../../providers/SessionProvider';
import store, { Message, User } from '../../store/store';
import { sortedArrayString } from '../../utilities';

export default observer(() => {
  const { address } = useLocalSearchParams();
  const db = useSQLiteContext();

  const { session } = useSession();
  const [messageText, setMessageText] = useState('');

  const user: User | null = _.find(store.users, ['address', address]) || null;

  useEffect(() => {
    async function setup() {
      if (!user) {
        await store.initializeUser(db, address as string);
      }
    }
    setup();
  }, [address]);

  const chatId = crypto
    .digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      `${sortedArrayString([session?.address as string, address as string])}`,
    )
    .toString();
  const messages = _.filter(store.messages, ['chatId', chatId]);

  const sendMessage = () => {
    store.addMessage(
      db,
      Message.fromJson({
        id: '0x1',
        chatId,
        content: messageText,
        receiver: address as string,
        sender: session?.address as string,
        timestamp: dayjs().toISOString(),
      }),
    );
    setMessageText('');
  };

  return (
    <View>
      <View>
        <ChatMessagesList user={user} messages={messages} />
      </View>
      <View>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type your message here..."
          className="border border-gray-300 px-4 py-2 rounded-lg"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
});
