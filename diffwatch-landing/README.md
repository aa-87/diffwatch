# DiffWatch — Landing/Signup

See repository for setup instructions. Run `npm i`, `npm run prisma:migrate`, `npm run dev`.

Stripe webhook: `/billing/webhook` (mounts raw body before JSON parser). OAuth: GitHub/Google/GitLab. Email verification with Postmark.


`
server/ — Express app, routes (auth, stripe, raw stripe-webhook, ott), security (Helmet, rate-limit), sessions.

prisma/ — Prisma schema + seed script (SQLite).

public/ — Landing, signup, pricing, success, verify, legal pages, styles, assets.

.env.example — all required config keys.

README.md — quick setup.

Quick start

Unzip and cd diffwatch-landing

cp .env.example .env and fill values

npm i

npm run prisma:generate && npm run prisma:migrate && npm run db:seed

npm run dev → http://localhost:3000

Notes

The Stripe webhook is mounted before JSON parsing to preserve the raw body signature.

OTT route is ready: the Landing issues a token and the App exchanges it via x-dw-shared-secret.

The legal pages are included; update contact details/address as needed.

The hero image and icons are placeholders—replace with your final visuals when ready.

If you want me to also generate the App service zip (consumer for /auth/consume-ott that sets its own session), say the word and I’ll package it the same way.
`
