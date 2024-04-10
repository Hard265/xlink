import { Feather } from '@expo/vector-icons';
import { PrivateKey } from 'eciesjs';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import Text from '../components/Text';
import { entropyToMnemonic } from '../encryption/bip39';
import { generateKeyPair, createUser } from '../encryption/key';
import { useSession } from '../providers/SessionProvider';
import { copyToClipboard } from '../utilities';

export default function Page() {
  const { signIn } = useSession();

  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState<PrivateKey | null>(null);
  const [mnemonicSeed, setMnemonicSeed] = useState('');
  const [copied, setCopied] = useState(false);

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
    copyToClipboard(mnemonicSeed.trim()).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 5000);
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator className="h-32 w-32" color="#000" size="large" />
      </View>
    );
  }

  return (
    <View className="p-4 flex-1 justify-center items-center dark:bg-black">
      <View className="my-auto">
        <View className="flex flex-row flex-wrap gap-2 items-center justify-center">
          {mnemonicSeed.split(' ').map((mnemonic, index) => {
            return (
              <View
                className="p-1.5 bg-gray-200 rounded-lg flex-row items-center gap-x-1.5 shadow-sm dark:bg-gray-800"
                key={index}>
                <Text className="text-gray-400">{index + 1}</Text>
                <Text className="dark:text-white">{mnemonic}</Text>
              </View>
            );
          })}
        </View>
        <Copier copied={copied} oncopy={oncopy} />
      </View>
      <Pressable
        onPress={onsignin}
        className="flex w-full justify-center rounded-xl bg-black dark:bg-white px-3 py-2.5 shadow-sm">
        <Text className="text-sm text-center leading-6 text-white dark:text-black capitalize">
          continue
        </Text>
      </Pressable>
    </View>
  );
}

interface CopierProps {
  copied: boolean;
  oncopy: () => void;
}
function Copier({ copied, oncopy }: CopierProps) {
  return copied ? (
    <Text className="text-center text-blue-600 dark:text-blue-500 mt-4 justify-center">
      <Feather name="check" size={16} /> Copied!
    </Text>
  ) : (
    <Text
      onPress={oncopy}
      className="text-center text-blue-600 dark:text-blue-500 mt-4 justify-center">
      <Feather name="copy" size={16} /> Copy
    </Text>
  );
}
