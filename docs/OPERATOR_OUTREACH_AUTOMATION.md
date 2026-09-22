# PQ-RDL Node Operator Outreach Automation

## Purpose

This service manages an auditable outreach pipeline for prospective PQ-RDL node operators: invite, technical brief, optional voice call, follow-up, inbound-response classification, opt-out handling, and operator-state tracking.

It is deliberately **truth-first**. Current outreach templates describe PQ-RDL as the repository currently documents it: a prototype / CI-verified operational devnet, not a verified public mainnet.

## Safety and compliance defaults

- Contacts are not messaged unless `consent=true`.
- `declined` and `do-not-contact` contacts are blocked.
- The default minimum contact interval is 48 hours.
- Every message or skipped attempt is written to the local outreach event log.
- "unsubscribe", "stop", "do not contact", and "opt out" responses immediately disable further outreach.
- The repository does not contain provider credentials or operator contact data.
- Voice outreach is off by default.
- The system does not scrape emails or phone numbers. Import only contacts you are authorized to contact.
- Before production outreach, review applicable anti-spam, telemarketing, privacy, and recording-consent law for each recipient jurisdiction.

## Storage

Default state file:

`data/operator-outreach.json`

The repository already ignores `data/`, preventing operator PII from being committed by default.

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

With no provider URL configured, delivery is a dry-run and records `providerMessageId=dry-run`.

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
OPERATOR_GATEWAY_TOKEN=...
```

A gateway can then connect to Gmail, SendGrid, SES, Postmark, Mailgun, or an internal mail service without placing those credentials in this repository.

## Voice / call gateway

Voice is disabled unless explicitly enabled:

```bash
OPERATOR_ENABLE_VOICE=true
OPERATOR_VOICE_WEBHOOK_URL=https://your-gateway.example/call
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

Start the webhook receiver:

```bash
npm run operator:server
```

Endpoint:

`POST /webhooks/response`

Body:

```json
{ "operatorId": "<id>", "body": "Interested, tell me more" }
```

Set `OPERATOR_INBOUND_TOKEN` and send `Authorization: Bearer <token>` in production.

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

1. Configure email/voice gateways and secrets outside Git.
2. Verify sender identity and reply handling.
3. Add jurisdiction-appropriate legal footer and organization identity.
4. Establish consent/source evidence for every imported operator.
5. Test with internal addresses first.
6. Verify opt-out end-to-end.
7. Keep voice calls disabled until telephony compliance is reviewed.
8. Monitor bounce, complaint, opt-out, conversion, and active-node metrics.
