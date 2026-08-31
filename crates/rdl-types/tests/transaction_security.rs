use ed25519_dalek::SigningKey;
use rand_core::OsRng;
use rdl_types::Transaction;

#[test]
fn signed_transaction_verifies() {
    let key = SigningKey::generate(&mut OsRng);
    let mut tx = Transaction {
        from: String::new(),
        to: "rdl-test".into(),
        nonce: 1,
        payload: b"reality-mode".to_vec(),
        public_key: vec![],
        signature: vec![],
    };
    tx.sign(&key);
    assert!(tx.verify());
}

#[test]
fn tampered_transaction_fails_verification() {
    let key = SigningKey::generate(&mut OsRng);
    let mut tx = Transaction {
        from: String::new(),
        to: "rdl-test".into(),
        nonce: 1,
        payload: b"original".to_vec(),
        public_key: vec![],
        signature: vec![],
    };
    tx.sign(&key);
    tx.payload = b"tampered".to_vec();
    assert!(!tx.verify());
}
