import { Token, TokenType } from '../types';

export const CANONICAL_TESTNET_TOKENS: Token[] = [
  {
    id: 'tok_rdl_stablecoin_001',
    name: 'RDL Stablecoin',
    symbol: 'rUSD',
    decimals: 6,
    totalSupply: 10000000,
    isUnlimitedSupply: true, // Mintable via reserve vault deposit
    type: 'STABLECOIN',
    creatorAddress: 'pq1dil2genesis00000000000000000000000000000',
    contractAddress: 'pq1sc_rdl_usd_stable_vault_v1',
    balances: {
      'pq1dil2genesis00000000000000000000000000000': 8000000,
      'testnet_faucet': 2000000,
    },
    createdAt: 1726400000000,
    pegCurrency: 'USD',
    oraclePriceUsd: 1.00,
    reserveRatio: 100,
    collateralVault: '0xrdl_sovereign_treasury_vault_dilithium',
    automatonEvolutionYield: 5.0,
  },
  {
    id: 'tok_rdl_memecoin_002',
    name: 'RDL Meme Coin',
    symbol: 'RLD',
    decimals: 0,
    totalSupply: 1000000000000,
    isUnlimitedSupply: false, // Deflationary fixed supply
    type: 'MEMECOIN',
    creatorAddress: 'pq1dil2genesis00000000000000000000000000000',
    contractAddress: 'pq1sc_rdl_meme_conway_burn_v1',
    balances: {
      'pq1dil2genesis00000000000000000000000000000': 700000000000,
      'testnet_faucet': 300000000000,
    },
    createdAt: 1726400000000,
    burnRatePercentage: 1.5,
    memeLore: 'Official Sovereign RDL Meme Coin with Conway cellular automaton deflation.',
    conwayPatternSeed: 'RDL-Living-Lattice-Glider-B3/S23',
    automatonEvolutionYield: 2.718,
  },
];

export class TokenEngine {
  private tokens: Token[];

  constructor(initialTokens: Token[] = CANONICAL_TESTNET_TOKENS) {
    this.tokens = structuredClone(initialTokens);
  }

  public getTokens(): Token[] {
    return structuredClone(this.tokens);
  }

  public getTokenById(id: string): Token | undefined {
    const token = this.findToken(id);
    return token ? structuredClone(token) : undefined;
  }

  private findToken(id: string): Token | undefined {
    const q = (id || '').toUpperCase();
    return this.tokens.find(
      t => t.id === id ||
           t.symbol.toUpperCase() === q ||
           t.contractAddress === id ||
           (q === 'RDL-USD' && t.symbol === 'rUSD') ||
           (q === 'RDL-MEME' && t.symbol === 'RLD')
    );
  }

  public createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    isUnlimitedSupply?: boolean;
    type: TokenType;
    creatorAddress: string;
    pegCurrency?: string;
    oraclePriceUsd?: number;
    reserveRatio?: number;
    collateralVault?: string;
    burnRatePercentage?: number;
    memeLore?: string;
    conwayPatternSeed?: string;
  }): Token {
    if (!this.validAmount(params.totalSupply) || !this.validAddress(params.creatorAddress) ||
        !Number.isInteger(params.decimals) || params.decimals < 0 || params.decimals > 18 ||
        (params.burnRatePercentage !== undefined && (!Number.isFinite(params.burnRatePercentage) || params.burnRatePercentage < 0 || params.burnRatePercentage > 100))) {
      throw new Error('Invalid token supply, address, decimals or burn rate');
    }
    const id = `tok_${params.symbol.toLowerCase()}_${Date.now().toString(16)}`;
    const contractAddress = `pq1sc_${params.symbol.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.random().toString(16).slice(2, 10)}`;
    const balances: Record<string, number> = {
      [params.creatorAddress]: params.totalSupply,
    };

    const newToken: Token = {
      id,
      name: params.name,
      symbol: params.symbol.toUpperCase(),
      decimals: params.decimals,
      totalSupply: params.totalSupply,
      isUnlimitedSupply: Boolean(params.isUnlimitedSupply),
      type: params.type,
      creatorAddress: params.creatorAddress,
      contractAddress,
      balances,
      createdAt: Date.now(),
      pegCurrency: params.pegCurrency,
      oraclePriceUsd: params.oraclePriceUsd ?? (params.type === 'STABLECOIN' ? 1.00 : undefined),
      reserveRatio: params.reserveRatio ?? (params.type === 'STABLECOIN' ? 100 : undefined),
      collateralVault: params.collateralVault,
      burnRatePercentage: params.burnRatePercentage,
      memeLore: params.memeLore,
      conwayPatternSeed: params.conwayPatternSeed || 'B3/S23-Living-Matrix',
      automatonEvolutionYield: params.type === 'STABLECOIN' ? 5.0 : 1.414,
    };

    this.tokens.push(newToken);
    return structuredClone(newToken);
  }

  private validAmount(amount: number): boolean {
    return Number.isFinite(amount) && amount > 0 && amount <= Number.MAX_SAFE_INTEGER;
  }

  private validAddress(address: string): boolean {
    return typeof address === 'string' && address.trim().length > 0 &&
      !['__proto__', 'constructor', 'prototype'].includes(address);
  }

  public mintToken(tokenId: string, recipientAddress: string, amount: number): { success: boolean; error?: string; newTotalSupply?: number } {
    const token = this.findToken(tokenId);
    if (!token) return { success: false, error: 'Token not found' };
    if (!token.isUnlimitedSupply) {
      return { success: false, error: 'Token has fixed supply; minting is disabled.' };
    }

    if (!this.validAmount(amount) || !this.validAddress(recipientAddress)) return { success: false, error: 'Invalid amount or recipient' };
    if (!this.validAmount(token.totalSupply + amount) || !this.validAmount((token.balances[recipientAddress] || 0) + amount)) return { success: false, error: 'Balance or supply overflow' };
    token.totalSupply += amount;
    token.balances[recipientAddress] = (token.balances[recipientAddress] || 0) + amount;
    return { success: true, newTotalSupply: token.totalSupply };
  }

  public transferToken(
    tokenId: string,
    senderAddress: string,
    receiverAddress: string,
    amount: number
  ): { success: boolean; error?: string; burnedAmount?: number; transferredAmount?: number } {
    const token = this.findToken(tokenId);
    if (!token) return { success: false, error: 'Token not found' };

    if (!this.validAmount(amount) || !this.validAddress(senderAddress) || !this.validAddress(receiverAddress)) return { success: false, error: 'Invalid amount or address' };
    if (senderAddress !== receiverAddress && !this.validAmount((token.balances[receiverAddress] || 0) + amount)) return { success: false, error: 'Balance overflow' };
    if (token.burnRatePercentage !== undefined && (!Number.isFinite(token.burnRatePercentage) || token.burnRatePercentage < 0 || token.burnRatePercentage > 100)) return { success: false, error: 'Invalid burn rate' };
    const senderBalance = token.balances[senderAddress] || 0;
    if (senderBalance < amount) {
      return { success: false, error: `Insufficient balance. Available: ${senderBalance} ${token.symbol}` };
    }

    let transferAmount = amount;
    let burnedAmount = 0;

    // Apply deflationary burn for meme coins
    if (token.type === 'MEMECOIN' && token.burnRatePercentage && token.burnRatePercentage > 0) {
      burnedAmount = (amount * token.burnRatePercentage) / 100;
      transferAmount = amount - burnedAmount;
      token.totalSupply -= burnedAmount;
    }

    token.balances[senderAddress] = senderBalance - amount;
    token.balances[receiverAddress] = (token.balances[receiverAddress] || 0) + transferAmount;

    return { success: true, transferredAmount: transferAmount, burnedAmount };
  }

  public claimFaucet(tokenId: string, recipientAddress: string, amount: number): { success: boolean; amountClaimed: number; error?: string } {
    const token = this.findToken(tokenId);
    if (!token) return { success: false, amountClaimed: 0, error: 'Token not found' };

    if (!this.validAmount(amount) || !this.validAddress(recipientAddress) || recipientAddress === 'testnet_faucet') {
      return { success: false, amountClaimed: 0, error: 'Invalid amount or recipient' };
    }
    const faucetBalance = token.balances['testnet_faucet'] || 0;
    if (faucetBalance < amount) return { success: false, amountClaimed: 0, error: 'Faucet has insufficient funds' };
    const nextBalance = (token.balances[recipientAddress] || 0) + amount;
    if (!this.validAmount(nextBalance)) return { success: false, amountClaimed: 0, error: 'Balance overflow' };
    const claimAmount = amount;
    token.balances['testnet_faucet'] -= claimAmount;
    token.balances[recipientAddress] = nextBalance;

    return { success: true, amountClaimed: claimAmount };
  }

  public getBalancesForAddress(address: string): Array<{ token: Token; balance: number }> {
    return this.tokens.map(t => ({
      token: structuredClone(t),
      balance: t.balances[address] || 0,
    }));
  }

  public updateConwayEntropy(entropy: number) {
    for (const t of this.tokens) {
      if (t.type === 'STABLECOIN') {
        // Stabilize peg with entropy damping
        t.reserveRatio = Number((100 + (entropy - 42) * 0.05).toFixed(2));
      } else if (t.type === 'MEMECOIN') {
        // Meme volatility linked to Conway chaos
        t.automatonEvolutionYield = Number((entropy * 0.1).toFixed(3));
      }
    }
  }
}

export const tokenEngine = new TokenEngine();
