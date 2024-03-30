import { useState, useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';

import { useSession } from '../providers/SessionProvider'
import { entropyToMnemonic } from '../encryption/bip39';
import { generateKeyPair, createUser } from '../encryption/key';

export default function Page() {
  const { signIn } = useSession()
  
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState<KeyPair>();
  const [mnemonicSeed, setMnemonicSeed] = useState('');

  const setup = ()=>{
    setLoading(true);
    setKey(genarateKeyPair());
    setMnemonicSeed(entropyToMnemonic(key.toHex()));
    setLoading(false);
  }

  useEffect(() => {
    setup();
  }, []);

  const onsignin = ()=>{
    const user = createUser(key);
    signIn(user);
  }

  const oncopy = ()=>{
    console.log(mnemonicSeed)
  }

  if(loading){
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator/>
      </View>
    )
  }
  
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-lg capitalize">seed backup</Text>
      <Text className="text-slate-600 text-center">Please carefully jot down these words on a piece of paper and store it securely, as this is the sole method to recover your address.</Text>
      <View className="flex flex-row flex-wrap gap-2 items-center justify-center">
        {mnemonicSeed.split(' ').map((mnemonic, index) => {
          return (
            <View className="p-3 border border-gray-300 rounded-lg flex-row gap-x-2" key={index}>
              <Text className="text-gray-400">{index + 1}</Text>
              <Text>{mnemonic}</Text>
            </View>
          );
        })}
      </View>
      <Text className="text-center font-semibold leading-6 text-indigo-600 active:text-indigo-500">copy to clipboard</Text>
      <Pressable className="flex w-full justify-center rounded bg-slate-950 px-3 py-1.5 shadow-sm">
        <Text className="text-sm font-semibold leading-6 text-white">continue</Text>
      </Pressable>
    </View>
  );
}
