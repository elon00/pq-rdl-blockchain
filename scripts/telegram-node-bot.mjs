#!/usr/bin/env node
/**
 * PQ-RDL Blockchain — Telegram Cloud Node Runner
 * Launches the Telegram Bot daemon connecting to Telegram Cloud.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const botPath = path.resolve(__dirname, '../services/telegram-bot/bot.ts');

console.log('🤖 PQ-RDL Web4 // Launching Telegram Cloud Node Bot...');
console.log('📡 Telegram API: https://api.telegram.org');

const child = spawn('npx', ['tsx', botPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
