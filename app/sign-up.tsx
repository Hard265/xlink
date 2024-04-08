import { PrivateKey } from 'eciesjs';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { entropyToMnemonic } from '../encryption/bip39';
import { generateKeyPair, createUser } from '../encryption/key';
import { useSession } from '../providers/SessionProvider';
import { copyToClipboard } from '../utilities';

export default function Page() {
  const { signIn } = useSession();

  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState<PrivateKey | null>(null);
  const [mnemonicSeed, setMnemonicSeed] = useState('');

  useEffect(() => {
    setLoading(true);
    const _key = generateKeyPair();
    setMnemonicSeed(entropyToMnemonic(_key.toHex()));
    setKey(_key);
    setLoading(false);
  }, []);

  const onsignin = () => {
    if (key) {
      const user = createUser(key);
      signIn(user);
      router.replace('/(app)/');
    }
  };

  const oncopy = () => {
    copyToClipboard(mnemonicSeed.trim());
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator className="h-32 w-32" color="#000" size="large" />
      </View>
    );
  }

  return (
    <View className="p-4 flex-1 justify-center items-center">
      <View className="my-auto">
        <View className="flex flex-row flex-wrap gap-2 items-center justify-center">
          {mnemonicSeed.split(' ').map((mnemonic, index) => {
            return (
              <View
                className="p-1.5 border border-gray-300 rounded-lg flex-row items-center gap-x-1.5"
                key={index}>
                <Text className="text-gray-400">{index + 1}</Text>
                <Text className="font-semibold">{mnemonic}</Text>
              </View>
            );
          })}
        </View>
        <Text
          onPress={oncopy}
          className="text-center font-medium text-blue-600 dark:text-blue-500 hover:underline mt-4">
          copy to clipboard
        </Text>
      </View>
      <Pressable
        onPress={onsignin}
        className="flex w-full justify-center rounded bg-slate-950 px-3 py-2.5 shadow-sm">
        <Text className="text-sm text-center font-semibold leading-6 text-white capitalize">
          continue
        </Text>
      </Pressable>
    </View>
  );
}
