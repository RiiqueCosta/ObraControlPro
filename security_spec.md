# Security Specification - ObraControl

## Data Invariants
1. A launch (`lancamento`) must belong to an existing active `obra`.
2. Total employees (`totalFuncionarios`) must be the sum of the `efetivo` list quantities.
3. Users can only edit/delete their own launches unless they are admins.
4. Only admins can manage the `obras` collection and user roles.

## Dirty Dozen Payloads (Rejection Targets)
1. Launch with negative `totalFuncionarios`.
2. Launch with a spoofed `criadoPor` ID.
3. Update to an `obra` from a non-admin account.
4. Update to a terminal `status` (e.g. 'finalizada') followed by another update from a non-admin.
5. Injecting a 2MB string into `observacoes`.
6. Creating a launch for a non-existent `obra` ID.
7. Modifying `criadoEm` after creation.
8. Escalating own role to 'admin' via profile update.
9. Deleting another user's launch as a 'user'.
10. Creating a user profile with `ativo: true` and `role: admin` directly.
11. Large array of `fotos` (> 20) to exhaust storage/cost.
12. Launch with a non-matching server timestamp for `atualizadoEm`.

## Security Rules Implementation Strategy
- Use `isValidId` for all path variables.
- Use `isAdmin()` check based on a document read in `/users/`.
- Strict type and size checks for every field.
- `affectedKeys().hasOnly()` for granular updates.
