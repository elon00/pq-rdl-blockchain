# RDL Identity-Aware Rate Limiting Foundation

RDL development nodes now apply a shared in-memory request budget keyed by the authenticated Ed25519 public key.

## Policy
- Maximum **20 requests per authenticated identity**
- Rolling window: **1 second**
- Budget is shared across concurrent connections for the same identity

When exceeded, the node returns:

`IDENTITY_RATE_LIMITED`

## Security benefit
Opening multiple TCP connections no longer bypasses the basic connection-scoped request pacing rule for the same authenticated identity.

## Reality boundary
This is an in-memory, node-local development limiter. It does not provide distributed rate coordination, durable quotas, Sybil resistance, economic spam resistance, or production observability. Those require a designed production networking and validator policy.
