import { tokenEngine } from './tokenEngine';
import { sha256Hex } from './pqCrypto';

export interface FaucetClaim {
  txHash: string;
  recipientAddress: string;
  nativeCoins: number;
  stablecoinAmount: number;
  memecoinAmount: number;
  timestamp: number;
  conwayProofNonce: number;
  status: 'CONFIRMED' | 'PENDING';
}

export interface FaucetStats {
  totalDispensations: number;
  totalNativeDispensed: number;
  totalStablecoinDispensed: number;
  totalMemecoinDispensed: number;
  remainingDailyAllowance: number;
}

export class FaucetEngine {
  private claims: FaucetClaim[] = [];
  private lastClaimByAddress: Record<string, number> = {};
  private readonly COOLDOWN_MS = 60 * 1000; // 60-second cooldown per address for testnet rate limiting

  public async dispense(
    recipientAddress: string,
    dropType: 'ALL' | 'NATIVE' | 'STABLECOIN' | 'MEMECOIN' = 'ALL'
  ): Promise<{ success: boolean; claim?: FaucetClaim; error?: string }> {
    if (!recipientAddress || recipientAddress.trim().length < 8) {
      return { success: false, error: 'Please specify a valid post-quantum recipient address (e.g. pq1dil2...)' };
    }

    const now = Date.now();
    const lastClaim = this.lastClaimByAddress[recipientAddress];
    if (lastClaim && now - lastClaim < this.COOLDOWN_MS) {
      const waitSecs = Math.ceil((this.COOLDOWN_MS - (now - lastClaim)) / 1000);
      return { success: false, error: `Anti-spam cooldown active: please wait ${waitSecs} seconds before requesting another faucet drop.` };
    }

    let nativeCoins = 0;
    let stablecoinAmount = 0;
    let memecoinAmount = 0;

    if (dropType === 'ALL' || dropType === 'NATIVE') {
      nativeCoins = 50; // 50 RDL / QBits for network gas & transactions
    }
    if (dropType === 'ALL' || dropType === 'STABLECOIN') {
      stablecoinAmount = 1000; // 1,000 RDL-USD
      tokenEngine.claimFaucet('tok_rdl_stablecoin_001', recipientAddress, stablecoinAmount);
    }
    if (dropType === 'ALL' || dropType === 'MEMECOIN') {
      memecoinAmount = 10000000; // 10,000,000 RDL-MEME
      tokenEngine.claimFaucet('tok_rdl_memecoin_002', recipientAddress, memecoinAmount);
    }

    const conwayNonce = Math.floor(Math.random() * 100000);
    const hashPayload = `FAUCET_DROP_${recipientAddress}_${nativeCoins}_${stablecoinAmount}_${memecoinAmount}_${now}_${conwayNonce}`;
    const txHash = `0xfaucet_${await sha256Hex(hashPayload)}`;

    const claim: FaucetClaim = {
      txHash,
      recipientAddress,
      nativeCoins,
      stablecoinAmount,
      memecoinAmount,
      timestamp: now,
      conwayProofNonce: conwayNonce,
      status: 'CONFIRMED',
    };

    this.claims.unshift(claim);
    this.lastClaimByAddress[recipientAddress] = now;

    return { success: true, claim };
  }

  public getRecentClaims(): FaucetClaim[] {
    return this.claims.slice(0, 10);
  }

  public getStats(): FaucetStats {
    return {
      totalDispensations: this.claims.length + 42, // Includes initial testnet genesis distributions
      totalNativeDispensed: this.claims.reduce((acc, c) => acc + c.nativeCoins, 2100),
      totalStablecoinDispensed: this.claims.reduce((acc, c) => acc + c.stablecoinAmount, 42000),
      totalMemecoinDispensed: this.claims.reduce((acc, c) => acc + c.memecoinAmount, 420000000),
      remainingDailyAllowance: 1000000,
    };
  }
}

export const faucetEngine = new FaucetEngine();
