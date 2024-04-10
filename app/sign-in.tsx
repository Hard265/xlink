import { Buffer } from 'buffer';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';

import Text from '../components/Text';
import { mnemonicToEntropy, validateMnemonic } from '../encryption/bip39';
import { createUser, generateKeyPair } from '../encryption/key';
import { useSession } from '../providers/SessionProvider';

export default function SignIn() {
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
    <View className="p-4 flex-1 justify-center items-center dark:bg-black">
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
          className={`block w-full rounded-xl py-2 px-3 bg-gray-100 dark:bg-gray-800 shadow border border-gray-200 focus:border-2 focus:border-gray-800 dark:focus:border-gray-600 ${
            invalid &&
            'border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500'
          }`}
        />
        <View className="w-full flex flex-row items-center justify-between p-0.5">
          {invalid && (
            <Text className="justify-self-start text-xs text-red-600">
              Please provide a valid 24 words seed
            </Text>
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
          <Text className="text-sm leading-6 text-black dark:text-white text-center">
            Create New Address
          </Text>
        </Pressable>
      )}
    </View>
  );
}
