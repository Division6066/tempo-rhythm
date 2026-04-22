# Tempo mobile

Expo mobile app inside the Tempo monorepo.

## Local setup

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Set `EXPO_PUBLIC_CONVEX_URL` to your active Convex deployment URL.
3. Start the shared backend if needed:

   ```bash
   bun x convex dev
   ```

4. Start Expo:

   ```bash
   bun run dev
   ```

## Notes

- Metro can start without Convex env vars, but the app cannot complete runtime initialization without `EXPO_PUBLIC_CONVEX_URL`.
- `PAYMENT_SYSTEM_ENABLED=false` keeps RevenueCat optional for local development.
