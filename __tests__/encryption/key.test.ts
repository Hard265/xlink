import { PrivateKey } from 'eciesjs';

import { entropyToMnemonic, mnemonicToEntropy } from '../../encryption/bip39';
import { sign, verify } from '../../encryption/cryptography';
import { generateKeyPair, createUser } from '../../encryption/key';
import { User } from '../../store/store';

describe('keys', () => {
  it('should generate hd key', async () => {
    const key = generateKeyPair();
    expect(key).toBeInstanceOf(PrivateKey);
  });

  it('should regenerate same entropy from mnemonic', () => {
    const key = generateKeyPair();
    const mnemonic = entropyToMnemonic(key.toHex());

    const entropy = mnemonicToEntropy(mnemonic);
    console.log(key.toHex(), entropy);
    expect(entropy).toBe(key.toHex());
  });

  it('should create a valid user', () => {
    const key = generateKeyPair();
    const user = createUser(key);

    expect(user).toBeInstanceOf(User);
  });

  it('should sign a message', () => {
    const key = generateKeyPair();
    const message = Buffer.from('test message').toString('hex');
    const signature = sign(key.toHex(), message);

    expect(typeof signature).toBe('string');
  });

  it('should verify a valid signature', () => {
    const key = generateKeyPair();
    const message = Buffer.from('test message').toString('hex');
    const signature = sign(key.toHex(), message);

    const isValid = verify(key.publicKey.toHex(), signature, message);

    expect(isValid).toBe(true);
  });
});
