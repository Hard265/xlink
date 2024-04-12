import { Feather } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Text, { TextBlack } from '../components/Text';
import { mnemonicToEntropy, validateMnemonic } from '../encryption/bip39';
import { createUser, generateKeyPair } from '../encryption/key';
import styles from '../misc/styles';
import { useSession } from '../providers/SessionProvider';

export default function SignIn() {
  const insets = useSafeAreaInsets();

  const [mnemonic, setMnemonic] = useState('');
  const { signIn } = useSession();
  const [invalid, setInvalid] = useState(false);

  const [showSignup, setShowSignup] = useState(true);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setShowSignup(false);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setShowSignup(true);
    });

    return () => {
      // Cleanup subscriptions
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const oninput = (value: string) => {
    setMnemonic(value);
    setInvalid(false);
  };

  const onsignin = () => {
    if (validateMnemonic(mnemonic.trim())) {
      signIn(createUser(generateKeyPair(Buffer.from(mnemonicToEntropy(mnemonic), 'hex'))));
      router.replace('/(app)/');
    } else setInvalid(true);
  };

  const counter = mnemonic.trim().split(' ').length;

  return (
    <View className="p-4 pt-0 flex-1 dark:bg-black">
      <Text className={`mt-[${insets.top}px] text-gray-800 dark:text-white text-right`}>
        <Feather name="help-circle" size={26} />
      </Text>
      <View className="mt-14">
        <TextBlack className="text-3xl filter blur-lg shadow-lg dark:text-white">Let's connect from here.</TextBlack>
        <Text className="text-gray-500 text-sm mt-2">
          Quisquam reprehenderit rerum dolores rerum est perspiciatis repellat et.
        </Text>
      </View>
      <View className="flex flex-col w-full mt-auto">
        <TextInput
          multiline
          placeholder="Enter your existing mnemonic seed"
          numberOfLines={3}
          textAlignVertical="top"
          value={mnemonic}
          onChangeText={oninput}
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
          style={[styles.fontFace.InterMedium]}
          className={`block w-full rounded-xl py-2 px-3 bg-gray-100 dark:bg-gray-800 shadow border border-gray-200 focus:border-2 focus:border-gray-800 dark:focus:border-gray-600 ${
            invalid && 'border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500'
          }`}
        />
        <View className="w-full flex flex-row items-center justify-between p-0.5">
          {invalid && (
            <Text className="justify-self-start text-xs text-red-600">Please provide a valid 24 words seed</Text>
          )}
          <Text className="text-xs justify-self-end ml-auto text-gray-500">{counter}/24</Text>
        </View>
        <Pressable
          onPress={onsignin}
          className="flex w-full justify-center rounded-xl bg-black dark:bg-white p-2.5 mt-2">
          <Text className="text-sm leading-6 text-white dark:text-black text-center">Import</Text>
        </Pressable>
      </View>
      {showSignup && (
        <Pressable
          onPress={() => router.push('/sign-up')}
          className="flex w-full justify-center rounded-xl bg-gray-200 dark:bg-gray-800 p-2.5 mt-12">
          <Text className="text-black dark:text-white text-center">Setup</Text>
        </Pressable>
      )}
    </View>
  );
}
