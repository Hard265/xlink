import { Feather } from '@expo/vector-icons';
import { PrivateKey } from 'eciesjs';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, TextInput, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Text, { TextBlack } from '../components/Text';
import { entropyToMnemonic } from '../encryption/bip39';
import { generateKeyPair, createUser } from '../encryption/key';
import styles from '../misc/styles';
import { useSession } from '../providers/SessionProvider';
import { copyToClipboard } from '../utilities';

export default function Page() {
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState<PrivateKey | null>(null);
  const [mnemonicSeed, setMnemonicSeed] = useState('');
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setLoading(true);
    const _key = generateKeyPair();
    setMnemonicSeed(entropyToMnemonic(_key.toHex()));
    setKey(_key);
    setLoading(false);
  }, []);

  const windowHeight = Math.round(Dimensions.get('window').height);
  const validInput = input.trim() !== mnemonicSeed.trim();

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
    <View
      style={{ minHeight: windowHeight + insets.top + insets.bottom }}
      className="p-4 pt-0  flex-1 justify-center dark:bg-black">
      <Text className={`pt-[${insets.top}px] text-gray-800 dark:text-white text-right`}>
        <Feather name="help-circle" size={26} />
      </Text>
      <View className="my-auto">
        <TextBlack className="text-3xl filter blur-lg shadow-lg  dark:text-white">Backup seed phrase</TextBlack>
        <Text className="text-gray-500 text-sm mt-2">
          Molestias ipsa fuga possimus quo quidem nemo aut et. Excepturi optio aut nam voluptatibus quisquam.
        </Text>
        <View className="flex flex-row flex-wrap gap-2 items-center justify-center mt-4">
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
      <TouchableOpacity
        onPress={() => setShowConfirm(true)}
        className="flex w-full justify-center rounded-xl bg-black dark:bg-white px-3 py-2.5 shadow-sm">
        <Text className="text-sm text-center leading-6 text-white dark:text-black capitalize">create</Text>
      </TouchableOpacity>

      <Modal transparent visible={showConfirm} statusBarTranslucent onRequestClose={() => setShowConfirm(false)}>
        <View className="bg-black/50 flex items-center justify-center h-full w-full p-2">
          <View className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col gap-y-2">
            <View className="flex-row mb-4">
              <Text className="pr-4 pt-1 dark:text-white">
                <Feather name="key" size={24} />
              </Text>
              <Text className="text-sm text-gray-800 dark:text-white">
                Ipsum repellendus maxime enim error necessitatibus nostrum nihil.{' '}
              </Text>
            </View>
            <TextInput
              multiline
              placeholder={mnemonicSeed.split(' ').slice(0, 4).join(' ') + ' ...'}
              numberOfLines={3}
              value={input}
              onChangeText={setInput}
              textAlignVertical="top"
              placeholderTextColor="#6B7280"
              autoCapitalize="none"
              style={[styles.fontFace.InterMedium]}
              className="block w-full dark:text-white rounded-xl py-2 px-3 bg-gray-100 dark:bg-gray-800 shadow border border-gray-200 focus:border-2 focus:border-gray-800 dark:focus:border-gray-600"
            />
            <View className="flex-row gap-x-4 justify-center items-center">
              <Text className="text-base p-2.5 pt-4 dark:text-white" onPress={() => setShowConfirm(false)}>
                Cancel
              </Text>
              <TouchableOpacity
                onPress={onsignin}
                disabled={validInput}
                className={`flex-1 block w-full justify-center rounded-xl bg-black${validInput ? '/25' : ''} dark:bg-white p-2.5 mt-2`}>
                <Text className="text-base text-white dark:text-black text-center">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    <Text onPress={oncopy} className="text-center text-blue-600 dark:text-blue-500 mt-4 justify-center">
      <Feather name="copy" size={16} /> Copy
    </Text>
  );
}
