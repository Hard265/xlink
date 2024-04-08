import { PrivateKey } from 'eciesjs';

import { decrypt, encrypt } from '../../encryption/cryptography';

describe('encryption', () => {
  it('should decrypt the message', () => {
    const message = 'Text to encrypt';
    const key = new PrivateKey();
    const encrypted = encrypt(key.publicKey.toHex(), message);
    const decrypted = decrypt(key.secret.toString('hex'), encrypted);
    expect(decrypted).toBe(message);
  });
});
