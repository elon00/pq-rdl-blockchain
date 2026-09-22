import type { OperatorContact } from './types.ts';

const repoUrl = 'https://github.com/elon00/pq-rdl-blockchain';

export function invitation(contact: OperatorContact) {
  const name = contact.name || 'Node operator';
  return {
    subject: 'Invitation: help operate the PQ-RDL prototype/devnet',
    body: `Hi ${name},

We are inviting technically capable operators to review and, if suitable, run a node for the PQ-RDL blockchain project.

Current status: the repository documents an operational CI-verified devnet/prototype. It is not being represented as a public mainnet or independently verified production network.

Repository: ${repoUrl}
Node operator guide: ${repoUrl}/blob/master/docs/NODE-OPERATOR-GUIDE.md
Cloud setup guide: ${repoUrl}/blob/master/docs/CLOUD_NODE_SETUP.md

If you are interested, reply with your preferred environment (Linux/cloud/on-prem), region, and whether you want a short technical briefing.

There is no guaranteed financial reward for operating a node. Any testnet incentives are experimental and subject to published protocol/governance terms.

Regards,
PQ-RDL operator outreach`
  };
}

export function briefing(contact: OperatorContact) {
  return {
    subject: 'PQ-RDL node operator technical briefing',
    body: `Hi ${contact.name},

Operator briefing:

1. Verify the repository and the exact release/commit you plan to run.
2. Follow docs/NODE-OPERATOR-GUIDE.md and docs/CLOUD_NODE_SETUP.md.
3. Protect node keys and API credentials; never commit secrets.
4. Start with the documented devnet/test environment.
5. Record reproducible evidence for node identity, version, connectivity, synchronization, restart/recovery and incidents.
6. Do not describe local or simulated results as independent public-network evidence.
7. Report security issues through the repository's responsible-disclosure process.

Repository: https://github.com/elon00/pq-rdl-blockchain

Reply with questions or your node environment and we can continue the onboarding sequence.`
  };
}

export function followUp(contact: OperatorContact) {
  return {
    subject: 'Follow-up: PQ-RDL node operator invitation',
    body: `Hi ${contact.name},

Following up on the PQ-RDL node-operator invitation. If you would like to evaluate the project, the quickest path is:

https://github.com/elon00/pq-rdl-blockchain
https://github.com/elon00/pq-rdl-blockchain/blob/master/docs/NODE-OPERATOR-GUIDE.md

If this is not relevant, reply "unsubscribe" and the outreach system should mark the contact do-not-contact.

Regards,
PQ-RDL operator outreach`
  };
}

export function voiceBrief(contact: OperatorContact) {
  return `Hello ${contact.name}. This is a technical invitation regarding the PQ-RDL blockchain prototype and devnet. We are looking for operators willing to review the repository and potentially run a node. The project is not being presented as a public mainnet, and no financial reward is guaranteed. Please review github dot com slash elon zero zero slash p q dash r d l dash blockchain. You may opt out of future contact at any time.`;
}
