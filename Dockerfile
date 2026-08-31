FROM rust:1-bookworm
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
RUN cargo build --workspace --release
CMD ["./target/release/rdl-node"]
