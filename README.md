# ThirdSpace Website

Welcome to the ThirdSpace website codebase. This repository contains the frontend implementation for ThirdSpace—Your Digital Growth Partner.

## Tech Stack
- React
- TypeScript
- Vite
- Tailwind CSS

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the application locally:
   ```bash
   npm run dev
   ```

## Quote Form Email Delivery

The quote form now submits to a Vercel function at `/api/quote` and forwards each request by email.

Set these environment variables in Vercel before using it in production:

- `RESEND_API_KEY`
- `QUOTE_TO_EMAIL`
- `QUOTE_FROM_EMAIL`

For local end-to-end testing of the form endpoint, use:

```bash
npx vercel dev
```
