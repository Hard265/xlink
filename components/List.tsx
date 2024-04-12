import { PropsWithChildren, ReactNode } from 'react';
import { TouchableOpacity, View } from 'react-native';

import Switch from './Switch';
import Text from './Text';

const List = () => {};

const Title = (props: PropsWithChildren) => {
  return <Text className="text-black dark:text-white capitalize">{props.children}</Text>;
};

const Card = (props: PropsWithChildren) => {
  return (
    <View className="overflow-hidden flex flex-col rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {props.children}
    </View>
  );
};

function CardItem({ title, append }: { title: string; append: ReactNode | string }) {
  return (
    <TouchableOpacity className="flex-row p-2.5 px-4 border-b border-gray-200 dark:border-gray-700 justify-between items-center">
      <Title>{title}</Title>
      <Title>{append}</Title>
    </TouchableOpacity>
  );
}

function CardSwitch({ value, title, onChange }: { value: boolean; title: string; onChange: (value: boolean) => void }) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      className="flex-row p-2.5 px-4 border-b border-gray-200 dark:border-gray-700 justify-between items-center">
      <Title>{title}</Title>
      <Switch value={value} onValueChange={(v) => onChange(v)} />
    </TouchableOpacity>
  );
}

Card.SwitchItem = CardSwitch;
Card.Item = CardItem;
List.Title = Title;
List.CardList = Card;

export default List;
