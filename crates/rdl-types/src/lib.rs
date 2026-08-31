use ed25519_dalek::{Signature, SigningKey, VerifyingKey, Signer, Verifier};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Transaction {
    pub from: String,
    pub to: String,
    pub nonce: u64,
    pub payload: Vec<u8>,
    pub public_key: Vec<u8>,
    pub signature: Vec<u8>,
}

impl Transaction {
    pub fn signing_bytes(&self) -> Vec<u8> {
        let mut tx = self.clone();
        tx.signature.clear();
        serde_json::to_vec(&tx).expect("canonical transaction serialization")
    }

    pub fn sign(&mut self, key: &SigningKey) {
        self.public_key = key.verifying_key().to_bytes().to_vec();
        self.from = hex::encode(Sha256::digest(&self.public_key));
        self.signature = key.sign(&self.signing_bytes()).to_bytes().to_vec();
    }

    pub fn verify(&self) -> bool {
        let Ok(pk) = <[u8; 32]>::try_from(self.public_key.as_slice()) else { return false };
        let Ok(sig) = Signature::from_slice(&self.signature) else { return false };
        let Ok(key) = VerifyingKey::from_bytes(&pk) else { return false };
        key.verify(&self.signing_bytes(), &sig).is_ok()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Block {
    pub height: u64,
    pub parent_hash: [u8; 32],
    pub state_root: [u8; 32],
    pub transactions: Vec<Transaction>,
}
