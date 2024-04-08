import 'react-native-get-random-values';
import { RIPEMD160, enc } from 'crypto-js';
import { PrivateKey } from 'eciesjs';

import { Admin } from '../store/store';

export function generateKeyPair(secrete?: Uint8Array) {
  return new PrivateKey(secrete);
}

export function createUser(key: PrivateKey): Admin {
  return {
    address: RIPEMD160(key.publicKey.toHex()).toString(enc.Base64url),
    publicKey: key.publicKey.toHex(),
    privateKey: key.toHex(),
  };
}
