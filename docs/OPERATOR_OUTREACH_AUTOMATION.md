# PQ-RDL Node Operator Outreach Automation

## Purpose

This service manages an auditable outreach pipeline for prospective PQ-RDL node operators: invite, technical brief, optional voice call, follow-up, inbound-response classification, opt-out handling, and operator-state tracking.

It is deliberately **truth-first**. Current outreach templates describe PQ-RDL as the repository currently documents it: a prototype / CI-verified operational devnet, not a verified public mainnet.

## Safety and compliance defaults

- Contacts are not messaged unless `consent=true`.
- `declined` and `do-not-contact` contacts are blocked.
- The default minimum contact interval is 48 hours; invalid stored timestamps fail closed.
- Dry-run messages are recorded as `dry-run` and do **not** advance operator state.
- Every message or skipped attempt is written to the local outreach event log.
- Opt-out phrases immediately disable further outreach.
- The inbound webhook refuses to start without a non-placeholder secret of at least 32 characters.
- Outbound gateway requests use a bounded timeout and require an authentication token.
- Gateway URLs must use HTTPS, except HTTP loopback URLs used for local development.
- Operator names are sanitized before being included in provider payloads or templates.
- Voice outreach is off by default.
- The system does not scrape emails or phone numbers. Import only contacts you are authorized to contact.
- Before production outreach, review applicable anti-spam, telemarketing, privacy, and recording-consent law for each recipient jurisdiction.

## Storage

Default state file:

`data/operator-outreach.json`

The repository ignores `data/`, preventing operator PII from being committed by default. File mutations are serialized with an inter-process lock and written via atomic rename.

The JSON store is suitable for a single-host operator service. For horizontally scaled or multi-host production deployments, use a transactional managed database and centralized secrets management rather than sharing this file over network storage.

## Add an operator

```bash
npm run operator:add -- \
  --name "Example Operator" \
  --email "ops@example.com" \
  --source "direct opt-in" \
  --tags "linux,cloud" \
  --consent
```

Do not set `--consent` unless there is a legitimate basis to contact the recipient.

## Run outreach

```bash
npm run operator:list
npm run operator:invite -- <operator-id>
npm run operator:brief -- <operator-id>
npm run operator:followup -- <operator-id>
npm run operator:response -- <operator-id> "Interested, please send the briefing"
```

With no provider URL configured, delivery is a dry-run. Dry-run events never claim that a real message was sent.

The CLI loads `.env.local` and `.env` without overriding environment variables already supplied by the deployment platform.

## Email gateway

Configure an HTTPS endpoint that accepts:

```json
{
  "type": "email",
  "to": "operator@example.com",
  "name": "Example Operator",
  "subject": "...",
  "body": "..."
}
```

Environment:

```bash
OPERATOR_EMAIL_WEBHOOK_URL=https://your-gateway.example/send
OPERATOR_GATEWAY_TOKEN=<random-secret>
OPERATOR_GATEWAY_TIMEOUT_MS=10000
```

When a gateway URL is configured, `OPERATOR_GATEWAY_TOKEN` is mandatory. The timeout is bounded to 1-60 seconds.

A gateway can connect to Gmail, SendGrid, SES, Postmark, Mailgun, or an internal mail service without placing those credentials in this repository.

## Voice / call gateway

Voice is disabled unless explicitly enabled:

```bash
OPERATOR_ENABLE_VOICE=true
OPERATOR_VOICE_WEBHOOK_URL=https://your-gateway.example/call
OPERATOR_GATEWAY_TOKEN=<random-secret>
```

Payload:

```json
{
  "type": "voice",
  "to": "+15551234567",
  "name": "Example Operator",
  "script": "...",
  "disclosure": "Automated or assisted project outreach. Recipient may opt out."
}
```

The gateway can connect to a telephony provider that is lawful for the relevant jurisdiction.

## Inbound responses

Set a strong secret before starting the service:

```bash
OPERATOR_INBOUND_TOKEN="$(openssl rand -hex 32)"
npm run operator:server
```

The server refuses to start if the token is missing, shorter than 32 characters, or still uses the example placeholder.

Endpoint:

`POST /webhooks/response`

Body:

```json
{ "operatorId": "<id>", "body": "Interested, tell me more" }
```

Header:

```text
Authorization: Bearer <OPERATOR_INBOUND_TOKEN>
```

Unknown operator IDs return 404; invalid requests return 400; unexpected storage or processing failures return 500 without exposing internal details.

## Campaign workflow

Recommended state flow:

`prospect -> invited -> interested -> briefed -> onboarding -> active`

Negative flow:

`prospect/invited -> declined`

Permanent suppression:

`* -> do-not-contact`

## Marketing usage

Use the system for targeted, permission-based technical recruitment rather than bulk unsolicited marketing. Good targets include operators who opted in through conferences, forms, direct conversations, ecosystem partnerships, GitHub discussions, or other channels where contact is expected.

Suggested campaign assets:

- README and node-operator guide
- cloud setup guide
- reproducible devnet/test instructions
- security and disclosure policy
- concise technical FAQ
- status page showing what is and is not independently verified

## Production checklist

1. Configure provider gateways and secrets in a managed secret store, not Git.
2. Verify sender identity, domain authentication, bounce handling, and reply routing.
3. Add jurisdiction-appropriate legal footer and organization identity.
4. Establish consent/source evidence for every imported operator.
5. Test with internal addresses first and confirm dry-run cannot advance contact state.
6. Verify opt-out end-to-end.
7. Keep voice calls disabled until telephony and recording-consent compliance is reviewed.
8. Monitor bounce, complaint, opt-out, conversion, delivery latency, and active-node metrics.
9. Use a transactional database before horizontally scaling the outreach service.
10. Keep public claims aligned with the repository's independently verifiable deployment evidence.
