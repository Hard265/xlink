import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, TextInput, View } from 'react-native';

import { entropyToMnemonic } from '../encryption/bip39';
import { generateKeyPair } from '../encryption/key';

export default function SignIn() {
  const [mnemonicInput, setMnemonicInput] = useState('');

  useEffect(() => {
    const key = generateKeyPair();
    const mnemonic = entropyToMnemonic(key.toHex());

    setMnemonicInput(mnemonic);
  }, []);

  const onsignin = async () => {
    
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        multiline
        placeholder="mnemonic (24 words)"
        value={mnemonicInput}
        onChangeText={setMnemonicInput}
        className="px-2 px-3"
      />
      <Button title="import" onPress={onsignin} />
    </View>
  );
}