import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey } from '@solana/web3.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    // Test basic Solana connection
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const testAddress = 'vines1vzrYbzLMRdu58or5GyzcJ96aqSRikB1PToNASq';
    const pubkey = new PublicKey(testAddress);
    const balance = await connection.getBalance(pubkey);

    return res.status(200).json({
      message: 'Solana works!',
      address: testAddress,
      balance: balance / 1e9,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
