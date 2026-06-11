
# Salli superuserin muokata muiden adminien oikeuksia

Tällä hetkellä työtilan jäsenlistalla (`/members/$tenantId`) admin-rivin roolivalitsin ja "Poista" -painike on lukittu, jos kohde on toinen admin. Tämä koskee myös superusereita, mikä estää heitä alentamasta tai poistamasta toista adminia. "Tee superuseriksi" -painike on jo paikallaan superusereille.

## Muutokset

**`src/routes/_authenticated.members.$tenantId.tsx`**

1. Päivitä `roleLocked`-logiikka niin, että superuserille rajoitus toista adminia kohtaan ei päde. Säilytä viimeisen adminin suoja itselle ja estä omaan rooliin koskeminen tarvittaessa.
2. Reititä jäsenrivin roolimuutos `superuserUpdateMemberRole`-funktion kautta, kun `isSuper` on tosi ja kohde on toinen admin (muuten edelleen normaali `updateMemberRole`). Tämä ohittaa "You cannot change another admin's role" -tarkistuksen serverillä.
3. Reititä "Poista" samalla periaatteella `superuserRemoveMember`-funktioon, kun superuser poistaa toista adminia, jotta poisto onnistuu (admin-vs-admin -poistoa ei muuten sallita; tämäkin pitää viimeisen adminin suojan).
4. Vahvista, että "Tee superuseriksi" / "Peruuta superuser" -painike näkyy edelleen kaikille jäsenriville superuserille (toiminto on jo `grantSuperM` / `revokeSuperM`). Ei muita muutoksia.

Ei tietokantamuutoksia: tarvittavat RPC:t (`superuserUpdateMemberRole`, `superuserRemoveMember`, `grant_superuser`) ovat jo olemassa ja tarkistavat itse superuser-oikeuden.

## Tekniset yksityiskohdat

```ts
const isPeerAdmin = m.role === "admin" && !isSelf;
const roleLocked = (isPeerAdmin && !isSuper) || (isSelf && isLastAdmin);

const onRoleChange = (role: "admin" | "member") => {
  if (isSuper && isPeerAdmin) suRoleM.mutate({ tenantId, userId: m.id, role });
  else updateM.mutate({ userId: m.id, role });
};

const onRemove = () => {
  if (isSuper && isPeerAdmin) suRemoveM.mutate({ tenantId, userId: m.id });
  else removeM.mutate(m.id);
  // (käytetään edelleen olemassa olevaa AlertDialog-vahvistusta)
};
```

Muutokset ovat puhtaasti frontendissä ja hyödyntävät jo olemassa olevia palvelinfunktioita.
