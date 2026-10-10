# Local Firebase AI authorization

The learning app uses the same Firebase AI backend in local previews and on the
published site. A local browser needs a registered Firebase App Check debug token;
enabling the SDK's debug mode alone does not authorize its generated token.

1. In the Firebase console for `test-data-895e2`, open **App Check**, select the
   `test-data` web app, and open **Manage debug tokens**.
2. Register a development token or reuse a token you already have registered.
3. Set `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN` to that token in `.env.local`.
4. Restart the Vite preview and reload the page before opening **Learn**.

`.env.local` is ignored by Git. Keep the token private. The app reads this setting
only in a Vite development build on `localhost`, `127.0.0.1`, or IPv6 loopback;
production builds continue to use the reCAPTCHA provider.

If Learn returns **401 / Firebase App Check token is invalid**, check that the
token is registered for this exact web app and that the development server has
reloaded `.env.local`. Registering a new token grants that development client access
to App Check-protected backend services and requires the project owner's approval.

Reference: [Firebase's App Check debug-provider setup](https://firebase.google.com/docs/app-check/web/debug-provider).
