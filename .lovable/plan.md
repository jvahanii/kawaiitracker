# Superuserille mahdollisuus tuhota mikä tahansa käyttäjä

## Mitä tehdään

Lisätään `/members/$tenantId` -sivun "Muut käyttäjät" -superuser-listalle "Poista käyttäjä" -nappi, joka tuhoaa käyttäjän kokonaan (auth + profiili + jäsenyydet).

## Backend

Uusi server function `superuserDeleteUser` tiedostoon `src/lib/api/superusers.functions.ts`:

- Input: `{ userId: uuid }`.
- Tarkistaa että kutsuja on superuser (`has_role`).
- Estot:
  - Ei voi poistaa itseään (`data.userId === context.userId` → virhe).
  - Jos kohde on superuser ja superusereita on vain 1 → virhe ("Cannot delete the last superuser").
- Käyttää `getSupabaseAdmin()` ja `admin.auth.admin.deleteUser(userId)`.
  - Auth-käyttäjän poisto cascadoi FK:n kautta `profiles`, `user_roles`, `tenant_members` jne. (kaikki viittaavat `auth.users(id) on delete cascade`).
- Palauttaa `{ ok: true }`.

## Frontend

`src/routes/_authenticated.members.$tenantId.tsx`:

- Lisää `useServerFn(superuserDeleteUser)` ja `useMutation` joka invalidoi `["all-workspace-users"]` ja näyttää toastin.
- Lisää state `deleteUserId: string | null` AlertDialogia varten.
- Riveille "Muut käyttäjät" -listalla (rinnalle grant/revoke-napin viereen): pieni "Poista" -nappi (destructive). Disabloitu jos `isSelf` tai `isLastSuper`.
- AlertDialog vahvistus ennen poistoa.

## Lokalisointi

`src/lib/locales/en.json` ja `fi.json`, `members.*`:
- `deleteUser` ("Delete user" / "Poista käyttäjä")
- `deleteUserConfirmTitle`, `deleteUserConfirmBody` (varoittaa pysyvyydestä)
- `deleteUserSuccess`
- `cannotDeleteSelf`, `cannotDeleteLastSuperuser`

## Tekninen huomio

`auth.admin.deleteUser` poistaa kovasti — kaikki käyttäjän data katoaa kaskadina. Tämä on tarkoituksella, koska superuser voi näin "tuhota minkä tahansa käyttäjän" pyynnön mukaan. AlertDialog-vahvistus on ainoa undo-mekanismi.
