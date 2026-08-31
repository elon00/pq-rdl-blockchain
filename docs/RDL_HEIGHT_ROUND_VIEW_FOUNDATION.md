# RDL Height/Round/View Consensus Foundation

## Implemented
- durable consensus context: height, round and view
- height/round/view bound into every signed vote payload
- deterministic proposer selection from a sorted validator set
- persistent consensus context in data/rdl-consensus.json
- failed quorum advances the local view/round
- QC verification checks the same height/round/view context

## Reality boundary
This is a consensus state foundation, not complete distributed view-change consensus. A local timeout/failure can advance local state, but validators do not yet exchange signed timeout certificates or synchronize view changes. Proposer selection also requires production governance for validator-set transitions.

Next: signed timeout messages, timeout certificates, coordinated view changes, equivocation evidence, and adversarial tests.
