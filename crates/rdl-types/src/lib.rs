use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Transaction {
    pub from: String,
    pub to: String,
    pub nonce: u64,
    pub payload: Vec<u8>,
    pub signature: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Block {
    pub height: u64,
    pub parent_hash: [u8; 32],
    pub state_root: [u8; 32],
    pub transactions: Vec<Transaction>,
}
