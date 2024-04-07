import { Text, View } from 'react-native';

import { User } from '../store/__store';

interface ChatListItemProps {
  item: User;
}

export function ChatListItem({ item }: ChatListItemProps) {
  return (
    <View>
      <Text>{item.address}</Text>
    </View>
  );
}
