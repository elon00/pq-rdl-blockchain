import { tokenEngine, TokenEngine } from './tokenEngine';
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
  private lastClaimByAddress = new Map<string, number>();
  private pending = new Set<string>();

  constructor(private readonly tokens: TokenEngine = tokenEngine) {}
  private readonly COOLDOWN_MS = 60 * 1000; // 60-second cooldown per address for testnet rate limiting

  public async dispense(
    recipientAddress: string,
    dropType: 'ALL' | 'NATIVE' | 'STABLECOIN' | 'MEMECOIN' = 'ALL'
  ): Promise<{ success: boolean; claim?: FaucetClaim; error?: string }> {
    if (!recipientAddress || recipientAddress.trim().length < 8) {
      return { success: false, error: 'Please specify a valid post-quantum recipient address (e.g. pq1dil2...)' };
    }

    recipientAddress = recipientAddress.trim();
    if (!['ALL', 'NATIVE', 'STABLECOIN', 'MEMECOIN'].includes(dropType) || recipientAddress === 'testnet_faucet') {
      return { success: false, error: 'Invalid faucet request' };
    }
    if (this.pending.has(recipientAddress)) return { success: false, error: 'Claim already pending' };
    const now = Date.now();
    const lastClaim = this.lastClaimByAddress.get(recipientAddress);
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

    }
    if (dropType === 'ALL' || dropType === 'MEMECOIN') {
      memecoinAmount = 10000000; // 10,000,000 RDL-MEME

    }

    this.pending.add(recipientAddress);
    try {
      const conwayNonce = Math.floor(Math.random() * 100000);
      const hashPayload = `FAUCET_DROP_${recipientAddress}_${nativeCoins}_${stablecoinAmount}_${memecoinAmount}_${now}_${conwayNonce}`;
      const txHash = `0xfaucet_${await sha256Hex(hashPayload)}`;
      // Preflight every token after the asynchronous hash, then debit synchronously.
      // An ALL drop cannot partially debit one token when the other is exhausted.
      const drops: Array<[string, number]> = [
        ['tok_rdl_stablecoin_001', stablecoinAmount],
        ['tok_rdl_memecoin_002', memecoinAmount],
      ];
      for (const [id, amount] of drops) {
        if (!amount) continue;
        const token = this.tokens.getTokenById(id);
        if (!token || (token.balances.testnet_faucet || 0) < amount ||
            (token.balances[recipientAddress] || 0) + amount > Number.MAX_SAFE_INTEGER) {
          return { success: false, error: 'Faucet has insufficient funds or recipient balance overflow' };
        }
      }
      for (const [id, amount] of drops) {
        if (amount) {
          const result = this.tokens.claimFaucet(id, recipientAddress, amount);
          if (!result.success) return { success: false, error: result.error };
        }
      }

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
      this.lastClaimByAddress.set(recipientAddress, now);

      return { success: true, claim };
    } finally {
      this.pending.delete(recipientAddress);
    }
  }

  public getRecentClaims(): FaucetClaim[] {
    return this.claims.slice(0, 10);
  }

  public getStats(): FaucetStats {
    return {
      totalDispensations: this.claims.length,
      totalNativeDispensed: this.claims.reduce((acc, c) => acc + c.nativeCoins, 0),
      totalStablecoinDispensed: this.claims.reduce((acc, c) => acc + c.stablecoinAmount, 0),
      totalMemecoinDispensed: this.claims.reduce((acc, c) => acc + c.memecoinAmount, 0),
      remainingDailyAllowance: 0, // No daily allowance accounting is implemented.
    };
  }
}

export const faucetEngine = new FaucetEngine();
