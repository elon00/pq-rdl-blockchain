use ed25519_dalek::SigningKey;
use rand_core::OsRng;
use rdl_types::{Block, Transaction};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;

const LEDGER_PATH: &str = "data/rdl-ledger.json";
const MAX_BLOCK_TXS: usize = 1_000;

fn hash_block(block: &Block) -> [u8; 32] {
    Sha256::digest(serde_json::to_vec(block).expect("block serialization")).into()
}

fn load_chain() -> Vec<Block> {
    if !Path::new(LEDGER_PATH).exists() { return Vec::new(); }
    serde_json::from_slice(&fs::read(LEDGER_PATH).expect("ledger read")).expect("ledger decode")
}

fn save_chain(chain: &[Block]) {
    fs::create_dir_all("data").expect("ledger directory");
    fs::write(LEDGER_PATH, serde_json::to_vec_pretty(chain).expect("ledger encode")).expect("ledger write");
}

fn validate_block(block: &Block, previous: Option<&Block>) -> Result<(), String> {
    if block.transactions.len() > MAX_BLOCK_TXS { return Err("block transaction limit exceeded".into()); }
    for tx in &block.transactions {
        if !tx.verify() { return Err(format!("invalid transaction signature at height {}", block.height)); }
    }
    match previous {
        None if block.height == 0 && block.parent_hash == [0; 32] => Ok(()),
        Some(prev) if block.height == prev.height + 1 && block.parent_hash == hash_block(prev) => Ok(()),
        _ => Err(format!("invalid block linkage at height {}", block.height)),
    }
}

fn validate_chain(chain: &[Block]) -> Result<(), String> {
    for (i, block) in chain.iter().enumerate() {
        validate_block(block, i.checked_sub(1).map(|j| &chain[j]))?;
    }
    Ok(())
}

fn produce_block(chain: &mut Vec<Block>, mempool: &mut Vec<Transaction>) -> Result<(), String> {
    let previous = chain.last();
    let height = previous.map(|b| b.height + 1).unwrap_or(0);
    let transactions: Vec<Transaction> = mempool.drain(..).take(MAX_BLOCK_TXS).collect();
    let block = Block {
        height,
        parent_hash: previous.map(hash_block).unwrap_or([0; 32]),
        state_root: [0; 32],
        transactions,
    };
    validate_block(&block, previous)?;
    chain.push(block);
    Ok(())
}

fn main() {
    let mut chain = load_chain();
    validate_chain(&chain).expect("existing ledger validation");

    if chain.is_empty() {
        let genesis = Block { height: 0, parent_hash: [0; 32], state_root: [0; 32], transactions: vec![] };
        validate_block(&genesis, None).expect("genesis validation");
        chain.push(genesis);
    }

    let key = SigningKey::generate(&mut OsRng);
    let mut tx = Transaction {
        from: String::new(), to: "rdl_demo_recipient".into(), nonce: 0,
        payload: b"RDL signed transaction".to_vec(), public_key: vec![], signature: vec![]
    };
    tx.sign(&key);

    let mut mempool = vec![tx];
    produce_block(&mut chain, &mut mempool).expect("block production");
    validate_chain(&chain).expect("chain validation");
    save_chain(&chain);

    println!("RDL Node v0.1.0 — deterministic block validation foundation");
    println!("ledger blocks: {}", chain.len());
    println!("STATUS: local block production implemented; no P2P consensus/testnet.");
}
