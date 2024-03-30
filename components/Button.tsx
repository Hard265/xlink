import React from 'react';
import { Pressable, PressableProps, Text } from 'react-native';
import colors from 'tailwindcss/colors';

const Button = () => {};

interface FilledButtonProps extends PressableProps {
  children: React.ReactNode;
  color?: keyof typeof colors;
}

const Filled = (props: FilledButtonProps) => {
  const color = props.color || 'slate';
  const className = `p-2 flex justify-center items-center border border-${color}-700 bg-${color}-600`;

  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      className="flex w-full justify-center rounded-md bg-slate-900 px-3 py-2">
      <Text className="text-sm font-semibold leading-6 text-white text-center">
        {props.children}
      </Text>
    </Pressable>
  );
};

const Outlined = () => {
  return (
    <Pressable>
      <Text />
    </Pressable>
  );
};

Button.Filled = Filled;
Button.Outlined = Outlined;

export default Button;
