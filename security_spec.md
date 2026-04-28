# Security Specification - ObraControl (Isolated Data Model)

## Data Invariants
1. A user profile must match the authentication UID.
2. A construction site (`obra`) must belong to the user who created it (`criadoPor == request.auth.uid`).
3. A daily log (`lancamento`) must belong to the user who created it and reference an `obra` they own.
4. Users cannot access, read, list, or write data belonging to other users.

## Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Creating an `obra` with a `criadoPor` field that doesn't match the authenticated user.
2. **Cross-User Read**: Attempting to `get` or `list` an `obra` or `lancamento` owned by another UID.
3. **Ghost Update**: Attempting to update another user's `obra` by guessing the ID.
4. **ID Poisoning**: Injecting path variables with IDs larger than 128 characters or with malicious characters.
5. **PII Leak**: An authenticated user attempting to read the private details of another user's profile.
6. **Schema Break**: Sending a `lancamento` with a string where an array of `servicos` is expected.
7. **Size Attack**: Sending a 1MB string in the `observacoes` field.
8. **Immutability Breach**: Attempting to change the `criadoPor` field after an `obra` has been created.
9. **Query Scrape**: Attempting a list query on `obras` without a `where('criadoPor', '==', uid)` clause (the rules must prevent this, not the query).
10. **Timestamp Fraud**: Providing a client-side timestamp instead of using `request.time` for `criadoEm`.
11. **Relational Sync Failure**: Creating a `lancamento` for an `obra` that doesn't exist or belongs to another user.
12. **Orphan Write**: Deleting an `obra` while leaving its `lancamentos` behind (though delete cascading is hard in rules, we can block the write if the parent is missing in some contexts, but usually we just deny the read of orphans if parent check is enforced).

## Security Rules Implementation Strategy
- **Master Gate**: Every access to `/obras/` and `/lancamentos/` MUST check `resource.data.criadoPor == request.auth.uid`.
- **Validation Blueprints**: Standalone `isValidUser`, `isValidObra`, and `isValidLancamento` functions.
- **Strict Keys**: Use `keys().hasAll()` and `size()` checks on creation to prevent shadow fields.
- **Action-Based Updates**: Granular `affectedKeys().hasOnly()` gates for specific field changes.
- **Secure List Queries**: `allow list` MUST evaluate `resource.data.criadoPor == request.auth.uid`.
