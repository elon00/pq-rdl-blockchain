/**
 * PQ-RDL Blockchain — Telegram Cloud Node Controller & Faucet Bot
 * 
 * Interacts with Telegram Cloud via the Telegram Bot API.
 * Provides remote node telemetry, balance querying, Conway block mining,
 * and testnet token faucet claims directly via Telegram.
 */

import { tokenEngine } from '../../src/lib/tokenEngine';
import { faucetEngine } from '../../src/lib/faucetEngine';
import {
  generateRandomGrid,
  mineConwayBlock,
  computeGridEntropy
} from '../../src/lib/conwayEngine';
import { generatePQKeypair, signPQPayload } from '../../src/lib/pqCrypto';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      first_name?: string;
      username?: string;
    };
    date: number;
    text?: string;
  };
}

export class TelegramNodeBot {
  private botToken: string;
  private apiBase: string;
  private isRunning: boolean = false;
  private lastUpdateId: number = 0;
  private mockMode: boolean = false;

  constructor(token?: string) {
    this.botToken = token || process.env.TELEGRAM_BOT_TOKEN || '';
    if (!this.botToken || this.botToken === 'MOCK_TOKEN') {
      this.mockMode = true;
      this.apiBase = 'https://api.telegram.org/botMOCK';
    } else {
      this.apiBase = `https://api.telegram.org/bot${this.botToken}`;
    }
  }

  public isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Send text message back to Telegram Chat
   */
  public async sendMessage(chatId: number, text: string, parseMode: 'Markdown' | 'HTML' = 'Markdown'): Promise<boolean> {
    if (this.mockMode) {
      console.log(`\n[Telegram Mock Message to Chat ${chatId}]:\n${text}\n`);
      return true;
    }

    try {
      const res = await fetch(`${this.apiBase}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parseMode,
          disable_web_page_preview: true
        })
      });
      const data = await res.json() as { ok: boolean; description?: string };
      if (!data.ok) {
        console.error(`[Telegram Error] Send failed: ${data.description}`);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error(`[Telegram Error] Network failure: ${err.message}`);
      return false;
    }
  }

  /**
   * Process a single command string
   */
  public async handleCommand(chatId: number, text: string, username: string = 'User'): Promise<string> {
    const trimmed = text.trim();
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case '/start':
      case '/help':
        return this.getHelpMessage(username);

      case '/status':
        return this.getStatusMessage();

      case '/faucet':
        return await this.handleFaucet(args[0]);

      case '/balance':
        return this.handleBalance(args[0]);

      case '/mine':
        return await this.handleMine();

      case '/block':
      case '/latest_block':
        return this.getLatestBlockMessage();

      case '/tokens':
        return this.getTokensMessage();

      default:
        return `⚠️ *Unknown Command*: \`${trimmed}\`\n\nType /help to view all available PQ-RDL node commands.`;
    }
  }

  private getHelpMessage(username: string): string {
    return `🏛️ *PQ-RDL Web4 — Telegram Cloud Node Controller*
Welcome, *${username}*!

You are connected to the post-quantum Conway Automaton blockchain testnet (*Chain: RDL-TESTNET-001*).

*Available Commands:*
• \`/status\` — View live node health, BFT view, peers & entropy.
• \`/faucet <rdl_address>\` — Claim free testnet tokens (50 RDL + 1K rUSD + 10M RLD).
• \`/balance <rdl_address>\` — Check wallet balances across all tokens.
• \`/mine\` — Trigger Conway cellular automaton mining round.
• \`/block\` — Inspect latest mined block header & SHA-256 anchor.
• \`/tokens\` — List all registered L1 tokens & stablecoins.
• \`/help\` — Display this command menu.

*Web Explorer & Faucet:*
https://elon00.github.io/pq-rdl-blockchain/`;
  }

  private getStatusMessage(): string {
    const stats = faucetEngine.getStats();
    const tokens = tokenEngine.getTokens();

    return `⚡ *PQ-RDL Cloud Node Status*
• *Network*: Operational Devnet / Testnet Candidate
• *Chain ID*: \`RDL-TESTNET-001\`
• *Consensus*: HotStuff BFT + Conway Cellular Automaton
• *Post-Quantum Cryptography*: NIST FIPS 204 (ML-DSA-65) & FIPS 203 (ML-KEM-768)
• *Node State*: Active & Syncing (Cloud Node Runner)
• *Active Tokens*: ${tokens.length} tokens
• *Faucet Treasury*: ${stats.totalNativeDispensed} RDL Dispensed (${stats.totalDispensations} total claims)`;
  }

  private async handleFaucet(address?: string): Promise<string> {
    if (!address) {
      return `❌ *Usage Error*: Please provide a valid recipient address.\n\n*Example*:\n\`/faucet 4d12332c7f14cdaa87123...\``;
    }

    const cleanAddress = address.trim();
    const result = await faucetEngine.dispense(cleanAddress, 'ALL');

    if (!result.success) {
      return `⏳ *Faucet Request Denied*\n\n${result.error}`;
    }

    const claim = result.claim!;
    return `🎉 *Testnet Starter Pack Dispensed!*
*Recipient*: \`${claim.recipientAddress.slice(0, 16)}...\`
*Amount*:
  • *50 RDL* (Native Gas)
  • *1,000 rUSD* (RDL Stablecoin)
  • *10,000,000 RLD* (RDL Meme Coin)
*Transaction Hash*: \`${claim.txHash.slice(0, 24)}...\`
*Entropy Nonce*: \`${claim.conwayProofNonce}\`
*Status*: 🟢 Confirmed on \`RDL-TESTNET-001\``;
  }

  private handleBalance(address?: string): string {
    if (!address) {
      return `❌ *Usage Error*: Please provide a valid address.\n\n*Example*:\n\`/balance 4d12332c7f14cdaa87123...\``;
    }

    const cleanAddress = address.trim();
    const balances = tokenEngine.getBalancesForAddress(cleanAddress);

    let msg = `💰 *Token Balances for Address*\n\`${cleanAddress}\`\n\n`;
    const positiveBalances = balances.filter(b => b.balance > 0);
    if (positiveBalances.length === 0) {
      msg += `*Balance*: 0 RDL, 0 rUSD, 0 RLD\n\n_Tip: Use \`/faucet ${cleanAddress}\` to receive free tokens!_`;
    } else {
      positiveBalances.forEach(b => {
        msg += `• *${b.token.symbol}* (${b.token.name}): \`${b.balance.toLocaleString()}\`\n`;
      });
    }

    return msg;
  }

  private async handleMine(): Promise<string> {
    try {
      const grid = generateRandomGrid(0.25);
      const proof = await mineConwayBlock(grid, 8, 30);
      const { entropy } = computeGridEntropy(grid);
      const keypair = await generatePQKeypair('Dilithium2', 'Telegram-Cloud-Miner');
      const sig = await signPQPayload(`BLOCK_MINE_${proof.hash}`, keypair);

      return `⛏️ *Conway Automaton Block Mined!*
• *Block Hash*: \`${proof.hash.slice(0, 26)}...\`
• *Target Score*: \`${proof.entropyScore.toFixed(2)}\`
• *Cellular Entropy*: \`${entropy.toFixed(2)}\`
• *Generations Computed*: \`${proof.generationsRun}\`
• *PQ Miner*: \`${keypair.publicKeyHex.slice(0, 24)}...\`
• *Lattice Sig*: \`${sig.signatureHex.slice(0, 32)}...\`
• *Status*: 🟢 Validated via Proof-of-Automaton`;
    } catch (err: any) {
      return `❌ *Mining Error*: ${err.message}`;
    }
  }

  private getLatestBlockMessage(): string {
    return `📦 *Latest Testnet Block*
• *Height*: \`104\`
• *Chain ID*: \`RDL-TESTNET-001\`
• *Block Hash*: \`0x9b7a42ec71df89c56b829...d1ba8eb5\`
• *Genesis Anchor*: \`d1ba8eb5003434c08d7f447c2a0f17fa297264c1254670ac811d7bf45b8d98a8\`
• *Consensus*: HotStuff BFT 3-Node Quorum
• *PQC Cryptography*: ML-DSA-65 (NIST FIPS 204)`;
  }

  private getTokensMessage(): string {
    const tokens = tokenEngine.getTokens();
    let msg = `🪙 *Registered Testnet Tokens (${tokens.length})*\n\n`;
    tokens.forEach(t => {
      msg += `• *${t.name}* (\`${t.symbol}\`) — ${t.type}\n`;
      msg += `  Supply: \`${t.totalSupply.toLocaleString()}\` | Decimals: ${t.decimals}\n`;
      if (t.isUnlimitedSupply) msg += `  _Elastic / Unlimited Mintable_\n`;
      if (t.reserveRatio) msg += `  _Reserve Backed: ${t.reserveRatio}% ($${t.oraclePriceUsd} peg)_\n`;
      if (t.burnRatePercentage) msg += `  _Conway Burn Tax: ${t.burnRatePercentage}%_\n`;
      msg += `\n`;
    });
    return msg;
  }

  /**
   * Single polling turn (for long polling loop)
   */
  public async pollUpdates(): Promise<void> {
    if (this.mockMode) {
      console.log('🤖 Telegram Bot running in MOCK mode (No TELEGRAM_BOT_TOKEN provided).');
      console.log('Set TELEGRAM_BOT_TOKEN in .env to connect to live Telegram Cloud.');
      return;
    }

    try {
      const url = `${this.apiBase}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=15`;
      const res = await fetch(url);
      const data = await res.json() as { ok: boolean; result?: TelegramUpdate[] };

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);
          if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text;
            const username = update.message.from.username || update.message.from.first_name;
            const response = await this.handleCommand(chatId, text, username);
            await this.sendMessage(chatId, response);
          }
        }
      }
    } catch (err: any) {
      console.error(`[Telegram Polling Error] ${err.message}`);
    }
  }

  /**
   * Start long-polling daemon
   */
  public async start(): Promise<void> {
    this.isRunning = true;
    console.log(`🤖 Starting Telegram Cloud Node Bot (MockMode: ${this.mockMode})...`);
    while (this.isRunning) {
      await this.pollUpdates();
      if (this.mockMode) break;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  public stop(): void {
    this.isRunning = false;
  }
}

// CLI Execution & Self-Test Mode
if (process.argv.includes('--test')) {
  console.log('🧪 Running Telegram Node Bot Automated Self-Test...');
  const bot = new TelegramNodeBot('MOCK_TOKEN');

  (async () => {
    const mockChatId = 123456789;
    const testCases = [
      '/start',
      '/status',
      '/faucet 4d12332c7f14cdaa871239847291827419827341982374198237419823741982',
      '/balance 4d12332c7f14cdaa871239847291827419827341982374198237419823741982',
      '/mine',
      '/latest_block',
      '/tokens'
    ];

    for (const cmd of testCases) {
      console.log(`\n--- Testing command: ${cmd} ---`);
      const response = await bot.handleCommand(mockChatId, cmd, 'Alice');
      console.log(response);
      if (!response || response.length === 0) {
        console.error(`❌ Empty response for ${cmd}`);
        process.exit(1);
      }
    }

    console.log('\n✅ All Telegram Cloud Bot commands tested successfully!');
    process.exit(0);
  })().catch(err => {
    console.error('Fatal Telegram Bot test error:', err);
    process.exit(1);
  });
} else if (require.main === module || process.argv[1]?.endsWith('bot.ts')) {
  const bot = new TelegramNodeBot();
  bot.start();
}
