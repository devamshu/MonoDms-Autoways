# Store listing assets

| Item | Where | Status |
|---|---|---|
| Privacy policy URL | `constants/legal.ts` (`LEGAL_LINKS.privacyPolicy`) | placeholder: `https://dms.autoways.com.np/followup` |
| Terms & conditions URL | `constants/legal.ts` (`LEGAL_LINKS.termsAndConditions`) | placeholder: same URL |
| Screenshots | `store-listing/screenshots/` | to add |

The Settings screen (CRM, Management and Warehouse) links to both URLs from its
"Legal" section. Change them in one place, `constants/legal.ts`.

## Screenshots

Drop the final images in `store-listing/screenshots/`, named by device and order
(`phone-01-login.png`, `phone-02-followup.png`, ...). Google Play needs at least
2 phone screenshots; Apple needs 6.5" and 5.5" sets.

## Reviewer access

Store reviewers need a demo login (the app is login-only). Record it in the
store console's "App access" section, not in this repo.
