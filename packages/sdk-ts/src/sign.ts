import { privateKeyToAccount } from 'viem/accounts';
import { type Hex } from 'viem';
import { DR1Schema, signingDigest, type DR1 } from '@ledgerline/schema';

export type PrivateKeyHex = `0x${string}`;
export type AddressHex = `0x${string}`;

export function addressFromPrivateKey(privateKey: string): AddressHex {
  return privateKeyToAccount(privateKey as PrivateKeyHex).address;
}

export async function signRecord(
  input: unknown,
  privateKey: string,
): Promise<DR1> {
  const parsed = DR1Schema.parse(input);
  const { operator_signature: _sig, _meta: _m, ...body } = parsed;
  const toSign = body as DR1;

  const account = privateKeyToAccount(privateKey as PrivateKeyHex);
  const digest = signingDigest(toSign);
  const signature = await account.sign({ hash: digest as Hex });

  const signed: DR1 = {
    ...toSign,
    operator_signature: {
      scheme: 'ECDSA-secp256k1' as const,
      public_key: account.address,
      signature,
      digest_algo: 'keccak256' as const,
    },
  };

  return DR1Schema.parse(signed);
}
