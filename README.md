This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend API

Set `NEXT_PUBLIC_API_URL` to the Laravel API origin (or its existing API
base). With the current `/v1` route prefix, local development uses:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/v1
```

Production defaults to `https://api.body-byu.com/v1` when this variable is
unset. In the production hosting/build environment, set
`NEXT_PUBLIC_API_URL=https://api.body-byu.com/v1`; Next.js inlines
`NEXT_PUBLIC_*` values at build time. The frontend normalizes origin-only,
`/api`, `/v1`, and `/api/v1` values to the `/v1` API base.

## Realtime payment notifications

The frontend subscribes to the authenticated user's private Reverb channel and
shows a notification when an admin approves a payment. Configure
`NEXT_PUBLIC_REVERB_APP_KEY`, `NEXT_PUBLIC_REVERB_HOST`,
`NEXT_PUBLIC_REVERB_PORT`, and `NEXT_PUBLIC_REVERB_SCHEME` in the frontend
build environment to match the backend `REVERB_*` settings and public
WebSocket proxy, and set backend `BROADCAST_CONNECTION=reverb`. Rebuild the
frontend after changing these values.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
