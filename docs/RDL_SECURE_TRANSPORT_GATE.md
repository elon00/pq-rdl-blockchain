# RDL Secure Transport Gate — Reality Mode

## Rule
Reality-mode network listeners must not silently start as plaintext production services.

RDL now requires TLS certificate and private-key material at:

- `data/rdl-tls-cert.pem`
- `data/rdl-tls-key.pem`

before the listener starts.

The node validates that the material can construct a Rustls server configuration.

## What this gate proves
- plaintext listener startup is refused when TLS material is absent
- certificate and private key parsing is validated
- Rustls server configuration compatibility is checked

## What remains
This gate is intentionally documented honestly: the existing application stream has **not yet been replaced by a Rustls encrypted stream**. The next implementation must wrap accepted and outbound TCP sockets in reviewed Rustls client/server connections, define certificate trust/rotation, and add interoperability tests.

No TLS-material gate should be marketed as completed encrypted transport.
