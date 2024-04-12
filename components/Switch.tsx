import { Feather } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import colors from 'tailwindcss/colors';

import Text from './Text';

interface SwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export default function Switch({ value, onValueChange }: SwitchProps) {
  const handlePress = () => {
    onValueChange(!value);
  };

  return (
    <Pressable onPress={handlePress}>
      <Text className="text-black dark:text-white">
        {value ? (
          <Feather name="toggle-left" size={24} />
        ) : (
          <Feather name="toggle-right" color={colors.green[600]} size={24} />
        )}
      </Text>
    </Pressable>
  );
}
