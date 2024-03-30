import { Buffer } from 'buffer';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { entropyToMnemonic, mnemonicToEntropy, validateMnemonic } from '../encryption/bip39';
import { createUser, generateKeyPair } from '../encryption/key';
import { useSession } from '../providers/SessionProvider';

export default function SignIn() {
  const [mnemonicInput, setMnemonicInput] = useState('');
  const { signIn } = useSession();

  useEffect(() => {}, []);

  const onsignin = async () => {
    if (validateMnemonic(mnemonicInput.trim())) {
      const user = createUser(
        generateKeyPair(Buffer.from(mnemonicToEntropy(mnemonicInput), 'hex')),
      );

      signIn(user);
      router.replace('/(app)/');
    }
  };
  const oncreate = () => {
    router.push('/sign-up');
  };

  const counter = mnemonicInput.trim().split(' ').length;

  return (
    <View className="p-4 flex-1 justify-center items-center">
      <View className="flex flex-col w-full my-auto">
        <TextInput
          multiline
          placeholder="mnemonic (24 words)"
          numberOfLines={3}
          textAlignVertical="top"
          value={mnemonicInput}
          onChangeText={setMnemonicInput}
          className="block w-full rounded-md py-2 px-3 border border-slate-300 focus:border-2 focus:border-slate-600"
        />
        <Text className="text-right text-xs leading-5 text-gray-500">{counter}/24</Text>
        <Pressable
          onPress={onsignin}
          className="flex w-full justify-center rounded-md bg-slate-950 px-3 py-2.5 mt-4">
          <Text className="text-sm font-semibold leading-6 text-white text-center">import</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={oncreate}
        className="flex w-full justify-center rounded-md bg-slate-300 px-3 py-2.5 mt-4">
        <Text className="text-sm font-semibold leading-6 text-slate-950 text-center">
          create new address
        </Text>
      </Pressable>
    </View>
  );
}
