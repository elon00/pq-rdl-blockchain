# RDL Operational Devnet

**Status: reproducible operational candidate — promotion still requires execution evidence.**

Run:

```bash
docker compose up --build -d
bash scripts/devnet-operational-smoke.sh
docker compose restart
```

The command pipeline validates configuration; promotion to VERIFIED OPERATIONAL DEVNET requires recorded evidence of successful startup, peer communication, persisted state after restart, and independent execution outside CI.
