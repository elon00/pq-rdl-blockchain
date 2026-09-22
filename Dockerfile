FROM rust:1-bookworm AS builder
WORKDIR /src
COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
RUN cargo build --locked --workspace --release

FROM debian:bookworm-slim AS runtime
RUN useradd --create-home --uid 10001 --shell /usr/sbin/nologin rdl     && mkdir -p /var/lib/rdl     && chown -R rdl:rdl /var/lib/rdl
COPY --from=builder /src/target/release/rdl-node /usr/local/bin/rdl-node
ENV RDL_DATA_DIR=/var/lib/rdl
USER rdl
EXPOSE 7000
CMD ["rdl-node"]
