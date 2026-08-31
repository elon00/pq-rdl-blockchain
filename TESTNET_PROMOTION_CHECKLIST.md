# RDL Public Testnet Promotion Checklist

Status: **DRAFT — NOT A LAUNCH RECORD**

## Required evidence

- [ ] Deterministic genesis artifact committed or released
- [ ] Genesis SHA-256 recorded in the network manifest
- [ ] Chain ID finalized
- [ ] At least two independently operated public nodes reachable
- [ ] Bootstrap endpoints published
- [ ] Independent nodes synchronize identical state
- [ ] Real Testnet transaction/state-transition integration test passes
- [ ] Restart and recovery test passes
- [ ] Health/status endpoints are externally observable
- [ ] Logs and monitoring are operational
- [ ] Release artifact version and checksums published
- [ ] Operator documentation published
- [ ] Security review findings tracked and remediated as required

## Promotion rule

Only mark the network **PUBLIC_TESTNET_VERIFIED** when every applicable item above has reproducible evidence. CI success alone is insufficient.
