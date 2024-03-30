import { RIPEMD160, enc } from 'crypto-js';
import { PrivateKey } from 'eciesjs';

import { BaseUser } from '../store/store';

export function generateKeyPair(secrete?: Uint8Array) {
  return new PrivateKey(secrete);
}

export function createUser(key: PrivateKey): BaseUser {
  const address = RIPEMD160(key.publicKey.toHex()).toString(enc.Base64url);
  return BaseUser.fromJson({
    address,
    publicKey: key.publicKey.toHex(),
    displayName: '--',
    privateKey: key.toHex(),
  });
}
