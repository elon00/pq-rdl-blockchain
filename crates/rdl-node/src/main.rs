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
    if !Path::new(LEDGER_PATH).exists() {
        return Vec::new();
    }
    let bytes = fs::read(LEDGER_PATH).expect("ledger read");
    serde_json::from_slice(&bytes).expect("ledger decode")
}

fn save_chain(chain: &[Block]) {
    fs::create_dir_all("data").expect("ledger directory");
    let bytes = serde_json::to_vec_pretty(chain).expect("ledger encode");
    fs::write(LEDGER_PATH, bytes).expect("ledger write");
}

fn validate_chain(chain: &[Block]) -> Result<(), String> {
    for (index, block) in chain.iter().enumerate() {
        if index > 0 {
            let expected = hash_block(&chain[index - 1]);
            if block.parent_hash != expected {
                return Err(format!("invalid parent hash at height {}", block.height));
            }
        }
    }
    Ok(())
}

fn main() {
    let mut chain = load_chain();
    validate_chain(&chain).expect("existing ledger validation");

    if chain.is_empty() {
        let genesis = Block {
            height: 0,
            parent_hash: [0; 32],
            state_root: [0; 32],
            transactions: Vec::<Transaction>::new(),
        };
        chain.push(genesis);
        save_chain(&chain);
    }

    println!("RDL Node v0.1.0 — persistent ledger foundation");
    println!("blocks: {}", chain.len());
    println!("STATUS: persistent local ledger implemented; P2P/consensus/testnet not implemented.");
}
