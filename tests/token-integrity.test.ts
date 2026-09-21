import test from 'node:test';
import assert from 'node:assert/strict';
import { TokenEngine, CANONICAL_TESTNET_TOKENS } from '../src/lib/tokenEngine';
import { FaucetEngine } from '../src/lib/faucetEngine';
const stable = 'tok_rdl_stablecoin_001';
const meme = 'tok_rdl_memecoin_002';
const owner = CANONICAL_TESTNET_TOKENS[0].creatorAddress;

test('rejects negative, zero, nonfinite and oversized amounts without mutation', () => {
  for (const amount of [-1, 0, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const engine = new TokenEngine();
    const before = engine.getTokens();
    assert.equal(engine.mintToken(stable, 'recipient', amount).success, false);
    assert.equal(engine.transferToken(stable, owner, 'recipient', amount).success, false);
    assert.equal(engine.claimFaucet(stable, 'recipient', amount).success, false);
    assert.deepEqual(engine.getTokens(), before);
  }
});

test('faucet exhaustion cannot create unbacked balances or partially fulfill requests', () => {
  const engine = new TokenEngine();
  assert.equal(engine.claimFaucet(stable, 'recipient', 2000001).success, false);
  assert.equal(engine.claimFaucet(stable, 'recipient', 2000000).success, true);
  const before = engine.getTokens();
  assert.equal(engine.claimFaucet(stable, 'recipient', 1).success, false);
  assert.deepEqual(engine.getTokens(), before);
  assert.equal(Object.values(engine.getTokenById(stable)!.balances).reduce((a,b)=>a+b,0), 10000000);
});

test('instances and returned snapshots cannot mutate canonical ledger state', () => {
  const first = new TokenEngine();
  const second = new TokenEngine();
  first.claimFaucet(stable, 'recipient', 10);
  first.getTokens()[0].balances[owner] = -100;
  first.getTokenById(stable)!.totalSupply = -1;
  assert.equal(first.getTokenById(stable)!.totalSupply, 10000000);
  assert.deepEqual(second.getTokens(), CANONICAL_TESTNET_TOKENS);
});

test('fixed supply minting is rejected and transfer burn conserves balances', () => {
  const engine = new TokenEngine();
  assert.equal(engine.mintToken(meme, 'recipient', 1).success, false);
  assert.equal(engine.transferToken(meme, owner, 'recipient', 100).success, true);
  const token = engine.getTokenById(meme)!;
  assert.equal(token.balances.recipient, 98.5);
  assert.equal(Object.values(token.balances).reduce((a,b)=>a+b,0), token.totalSupply);
});

test('self-transfer only debits the specified burn', () => {
  const engine = new TokenEngine();
  const before = engine.getTokenById(meme)!;
  assert.equal(engine.transferToken(meme, owner, owner, 100).success, true);
  assert.equal(engine.getTokenById(meme)!.balances[owner], before.balances[owner] - 1.5);
});

test('invalid addresses and overflow leave balances unchanged', () => {
  const engine = new TokenEngine();
  const before = engine.getTokens();
  for (const recipient of ['', ' ', '__proto__', 'constructor', 'prototype']) {
    assert.equal(engine.claimFaucet(stable, recipient, 1).success, false);
    assert.equal(engine.transferToken(stable, owner, recipient, 1).success, false);
  }
  assert.equal(engine.mintToken(stable, owner, Number.MAX_SAFE_INTEGER).success, false);
  assert.deepEqual(engine.getTokens(), before);
});

test('ALL faucet request fails atomically if one reserve is empty', async () => {
  const engine = new TokenEngine();
  engine.claimFaucet(meme, 'recipient', 300000000000);
  const before = engine.getTokens();
  const faucet = new FaucetEngine(engine);
  assert.equal((await faucet.dispense('recipient', 'ALL')).success, false);
  assert.deepEqual(engine.getTokens(), before);
  assert.equal(faucet.getStats().totalDispensations, 0);
});

test('concurrent faucet requests cannot bypass per-address cooldown', async () => {
  const engine = new TokenEngine();
  const faucet = new FaucetEngine(engine);
  const results = await Promise.all([faucet.dispense('recipient', 'STABLECOIN'), faucet.dispense('recipient', 'STABLECOIN')]);
  assert.equal(results.filter(r=>r.success).length, 1);
  assert.equal(engine.getTokenById(stable)!.balances.recipient, 1000);
  assert.equal(faucet.getStats().totalStablecoinDispensed, 1000);
  assert.equal((await faucet.dispense('recipient', 'STABLECOIN')).success, false);
});
