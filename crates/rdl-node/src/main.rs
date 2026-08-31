use ed25519_dalek::SigningKey;
use rand_core::OsRng;
use rdl_types::{Block, Transaction};
use sha2::{Digest, Sha256};
use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
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

fn replace_chain_if_valid(local: &mut Vec<Block>, candidate: Vec<Block>) -> Result<bool, String> {
    validate_chain(&candidate)?;
    if candidate.len() > local.len() {
        *local = candidate;
        return Ok(true);
    }
    Ok(false)
}

fn produce_block(chain: &mut Vec<Block>, mempool: &mut Vec<Transaction>) -> Result<(), String> {
    let previous = chain.last();
    let block = Block {
        height: previous.map(|b| b.height + 1).unwrap_or(0),
        parent_hash: previous.map(hash_block).unwrap_or([0; 32]),
        state_root: [0; 32],
        transactions: mempool.drain(..).take(MAX_BLOCK_TXS).collect(),
    };
    validate_block(&block, previous)?;
    chain.push(block);
    Ok(())
}

fn handle_peer(mut stream: TcpStream, chain: &mut Vec<Block>) -> std::io::Result<()> {
    let mut line = String::new();
    BufReader::new(stream.try_clone()?).read_line(&mut line)?;
    match line.trim() {
        "PING" => stream.write_all(b"PONG\n")?,
        "GET_HEIGHT" => stream.write_all(format!("HEIGHT {}\n", chain.last().map(|b| b.height).unwrap_or(0)).as_bytes())?,
        "GET_TIP_HASH" => {
            let tip = chain.last().map(hash_block).unwrap_or([0; 32]);
            stream.write_all(format!("TIP {}\n", hex_encode(&tip)).as_bytes())?
        }
        "GET_CHAIN" => {
            let payload = serde_json::to_string(chain).map_err(std::io::Error::other)?;
            stream.write_all(payload.as_bytes())?;
            stream.write_all(b"\n")?;
        }
        message if message.starts_with("SUBMIT_BLOCK ") => {
            let json = message.trim_start_matches("SUBMIT_BLOCK ");
            let block: Block = serde_json::from_str(json).map_err(std::io::Error::other)?;
            let previous = chain.last();
            match validate_block(&block, previous) {
                Ok(()) => {
                    chain.push(block);
                    save_chain(chain);
                    stream.write_all(b"ACCEPTED\n")?;
                }
                Err(_) => stream.write_all(b"REJECTED\n")?,
            }
        }
        _ => stream.write_all(b"ERROR unknown_message\n")?,
    }
    Ok(())
}

fn run_listener(addr: &str) -> std::io::Result<()> {
    let listener = TcpListener::bind(addr)?;
    let mut chain = load_chain();
    validate_chain(&chain).map_err(std::io::Error::other)?;
    println!("RDL development node listening on {}", addr);
    for stream in listener.incoming() {
        handle_peer(stream?, &mut chain)?;
    }
    Ok(())
}

fn request(addr: &str, message: &str) -> std::io::Result<String> {
    let mut stream = TcpStream::connect(addr)?;
    stream.write_all(message.as_bytes())?;
    stream.write_all(b"\n")?;
    let mut response = String::new();
    BufReader::new(stream).read_line(&mut response)?;
    Ok(response.trim().to_string())
}

fn sync_from_peer(addr: &str) -> Result<(), String> {
    let payload = request(addr, "GET_CHAIN").map_err(|e| e.to_string())?;
    let candidate: Vec<Block> = serde_json::from_str(&payload).map_err(|e| e.to_string())?;
    let mut local = load_chain();
    validate_chain(&local)?;
    if replace_chain_if_valid(&mut local, candidate)? {
        save_chain(&local);
        println!("SYNCED blocks={}", local.len());
    } else {
        println!("SYNC_NOT_NEEDED");
    }
    Ok(())
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() == 3 && args[1] == "--listen" {
        run_listener(&args[2]).expect("listener");
        return;
    }
    if args.len() == 3 && args[1] == "--sync" {
        sync_from_peer(&args[2]).expect("peer sync");
        return;
    }
    if args.len() == 3 && (args[1] == "--ping" || args[1] == "--height" || args[1] == "--tip") {
        let command = match args[1].as_str() {
            "--ping" => "PING", "--height" => "GET_HEIGHT", _ => "GET_TIP_HASH",
        };
        println!("{}", request(&args[2], command).expect("peer request"));
        return;
    }

    let mut chain = load_chain();
    validate_chain(&chain).expect("existing ledger validation");
    if chain.is_empty() {
        chain.push(Block { height: 0, parent_hash: [0; 32], state_root: [0; 32], transactions: vec![] });
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

    println!("RDL Node v0.1.0 — development chain sync foundation");
    println!("ledger blocks: {}", chain.len());
    println!("STATUS: validated development chain transfer/sync implemented; no authenticated gossip/fork-choice/Byzantine consensus/testnet.");
}
