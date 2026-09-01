# RDL Per-IP Connection Cap Foundation

RDL development nodes now enforce two connection bounds:

- **64 total active connections**
- **8 active connections per source IP address**

## Security benefit
The global cap protects overall node resources, while the per-IP cap reduces simple single-source connection exhaustion.

## Reality boundary
IP-based limits are not Sybil resistance and can be bypassed by distributed sources, NAT behavior can affect fairness, and production deployments need identity-aware quotas, rate limiting, backpressure, peer reputation and adversarial testing.
