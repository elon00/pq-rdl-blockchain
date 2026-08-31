use ed25519_dalek::SigningKey;
use rand_core::OsRng;
use rdl_types::{Block, Transaction};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;

const LEDGER_PATH: &str = "data/rdl-ledger.json";

fn hash_block(block: &Block) -> [u8; 32] {
    let bytes = serde_json::to_vec(block).expect("block serialization");
    Sha256::digest(bytes).into()
}

fn load_chain() -> Vec<Block> {
    if !Path::new(LEDGER_PATH).exists() { return Vec::new(); }
    serde_json::from_slice(&fs::read(LEDGER_PATH).expect("ledger read")).expect("ledger decode")
}

fn save_chain(chain: &[Block]) {
    fs::create_dir_all("data").expect("ledger directory");
    fs::write(LEDGER_PATH, serde_json::to_vec_pretty(chain).expect("ledger encode")).expect("ledger write");
}

fn validate_chain(chain: &[Block]) -> Result<(), String> {
    for (index, block) in chain.iter().enumerate() {
        for tx in &block.transactions {
            if !tx.verify() { return Err(format!("invalid transaction signature at height {}", block.height)); }
        }
        if index > 0 && block.parent_hash != hash_block(&chain[index - 1]) {
            return Err(format!("invalid parent hash at height {}", block.height));
        }
    }
    Ok(())
}

fn main() {
    let mut chain = load_chain();
    validate_chain(&chain).expect("existing ledger validation");

    if chain.is_empty() {
        chain.push(Block { height: 0, parent_hash: [0; 32], state_root: [0; 32], transactions: vec![] });
        save_chain(&chain);
    }

    let demo_key = SigningKey::generate(&mut OsRng);
    let mut demo_tx = Transaction { from: String::new(), to: "rdl_demo_recipient".into(), nonce: 0, payload: b"RDL signed transaction".to_vec(), public_key: vec![], signature: vec![] };
    demo_tx.sign(&demo_key);

    println!("RDL Node v0.1.0 — persistent signed-ledger foundation");
    println!("ledger blocks: {}", chain.len());
    println!("demo signature valid: {}", demo_tx.verify());
    println!("STATUS: local signed transactions implemented; P2P/consensus/testnet not implemented.");
}
