FROM rust:1-bookworm
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
RUN cargo build --workspace --release \
 && mkdir -p /app/data \
 && openssl req -x509 -newkey rsa:2048 -sha256 -days 365 -nodes \
      -keyout /app/data/rdl-tls-key.pem \
      -out /app/data/rdl-tls-cert.pem \
      -subj "/CN=rdl-devnet"
CMD ["./target/release/rdl-node"]
