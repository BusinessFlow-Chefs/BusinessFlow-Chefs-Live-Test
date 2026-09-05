# BusinessFlow Chefs Security Baseline

This repository is currently a **test/static application**, not a production security boundary. Client-side code alone must never be treated as sufficient protection for real guest, charter, account, inventory, supplier or payment data.

## Non-negotiable production launch gates

BusinessFlow must not accept real customer data in production until all of the following are implemented and verified.

### Identity and access
- Real server-backed authentication.
- MFA and/or passkeys supported; MFA required for privileged roles.
- Server-side session validation with short-lived access tokens and secure refresh handling.
- Role-based authorization enforced server-side for Chef, Captain, Crew, Owner and Admin roles.
- Account lockout / throttling and suspicious-login detection.
- No authorization decision may rely only on browser JavaScript or hidden UI controls.

### Data protection
- HTTPS everywhere.
- Encryption in transit and encryption at rest for production databases/backups.
- Sensitive guest data minimized and separated from public/static assets.
- No passwords, API keys, access tokens, private keys or service credentials in browser code, Git history, localStorage or static configuration.
- Export, deletion and retention controls for customer/guest data.

### API and abuse protection
- All privileged mutations performed through authenticated APIs.
- Input validation and output encoding at every trust boundary.
- Rate limiting and abuse throttling on authentication, AI, search, supplier, map and provisioning endpoints.
- Request-size limits and allow-lists where practical.
- CSRF protection where cookie-authenticated write endpoints are used.
- CORS restricted to approved BusinessFlow origins.

### Browser security
- Strict Content Security Policy in production response headers.
- `frame-ancestors` / anti-clickjacking protection.
- `X-Content-Type-Options: nosniff`.
- Strict referrer policy.
- Appropriate Permissions-Policy.
- No runtime dependence on temporary third-party asset URLs.
- User/AI supplied content rendered as text or sanitized before HTML insertion.

### Secrets and third-party integrations
- Secrets stored only in an approved server-side secret manager / deployment secret store.
- Separate credentials for development, test and production.
- Least-privilege API scopes.
- Key rotation and revocation procedure.
- Third-party providers isolated behind BusinessFlow adapters so a compromised/replaced provider does not require a full app rewrite.

### Reliability and recovery
- Versioned database schema and tested migrations.
- Encrypted backups with restore drills.
- Audit log for material actions (login, role changes, service-time changes, stock reconciliation, exports, destructive actions).
- Error monitoring without leaking guest data or credentials.
- Rollback path for every production deployment.

### Offline/mobile security
- Offline caches must contain only data required for the user's authorized role.
- Sensitive offline data encrypted where platform support allows and wiped on sign-out/revocation.
- Conflict resolution must preserve authorization and audit history.
- Lost-device/session revocation supported before production launch.

## Current static test build

The current GitHub Pages build is suitable for UI and workflow testing only. It currently stores demo operational state in browser storage and therefore must not be used for genuine sensitive guest or account data.

## Security review rule

Any feature that introduces authentication, payments, guest personal data, cloud sync, supplier ordering, maps/location history, AI APIs, external integrations or administrative access requires a security review before being enabled in production.
