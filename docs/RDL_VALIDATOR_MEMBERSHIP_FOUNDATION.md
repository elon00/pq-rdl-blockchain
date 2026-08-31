# RDL Validator Membership Foundation

RDL now has an explicit persistent validator-set foundation.

## Validator set
Validators are stored as Ed25519 public-key identifiers in:

`data/rdl-validators.json`

The implementation accepts at most **64 validators**.

## Current enforcement
- authenticated peers can query `GET_VALIDATOR_STATUS`
- block submission currently requires membership in the validator set
- quorum is calculated as `floor(2N/3)+1`

## Reality boundary
This is validator authorization and quorum calculation, **not BFT consensus**. There are no proposal rounds, votes, certificates, view changes, slashing, stake economics, validator governance, or Byzantine fault tests yet.

The validator set is currently file-managed for development. A production chain needs a versioned, consensus-governed validator-set transition mechanism.
