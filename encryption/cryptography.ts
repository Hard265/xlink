import 'react-native-get-random-values';
import '../polyfills/text-encoding';
import 'fast-text-encoding';
import { Buffer } from 'buffer';
import { PrivateKey, PublicKey } from 'eciesjs';
//@ts-ignore
import { ec as EC } from 'elliptic-expo';
import CryptoJS from 'react-native-crypto-js';

const ec = new EC('secp256k1');

export function sign(hexSK: string, dataHex: string): string {
  const key = ec.keyFromPrivate(hexSK, 'hex');
  return Buffer.from(key.sign(dataHex).toDER()).toString('hex');
}

export function verify(hexPub: string, signatureHex: string, dataHex: string) {
  const key = ec.keyFromPublic(hexPub, 'hex');
  return key.verify(dataHex, Buffer.from(signatureHex, 'hex'));
}

export function encrypt(receiverRawPK: string, plainText: string) {
  const ephemeralKey = new PrivateKey();
  const receiverPK = PublicKey.fromHex(receiverRawPK);
  const symKey = ephemeralKey.encapsulate(receiverPK);

  const pk: Uint8Array = ephemeralKey.publicKey.compressed;
  const encrypted = CryptoJS.AES.encrypt(plainText, Buffer.from(symKey).toString('hex')).toString(
    CryptoJS.format.Hex,
  );

  const cipherText = Buffer.from(concatenateBytes(pk, base64ToBytes(encrypted))).toString('base64');
  return cipherText;
}

export function decrypt(receiverRawSK: string, cipherText: string) {
  const cipherBuffer = Buffer.from(cipherText, 'base64');
  const pk = Buffer.from(Uint8Array.from(cipherBuffer).subarray(0, 33)).toString('hex');

  const encrypted = cipherBuffer
    .subarray(33, Uint8Array.from(cipherBuffer).length)
    .toString('base64');

  const receiverSK = PrivateKey.fromHex(receiverRawSK);
  const senderPK = new PublicKey(Buffer.from(pk, 'hex'));
  const symKey = senderPK.decapsulate(receiverSK);

  const decrypted = CryptoJS.AES.decrypt(encrypted, Buffer.from(symKey).toString('hex'));
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function concatenateBytes(arr1: Uint8Array, arr2: Uint8Array) {
  const result = new Uint8Array(arr1.length + arr2.length);
  result.set(arr1);
  result.set(arr2, arr1.length);
  return result;
}

function base64ToBytes(base64: string) {
  const binaryString = Buffer.from(base64, 'base64');
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    const el = binaryString.at(i);
    if (el) {
      bytes[i] = el;
    }
  }
  return bytes;
}
