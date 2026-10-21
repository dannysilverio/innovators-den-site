# Environment variable inventory

Names only. No credentials or existing configuration values are included.
Configure these through the destination host's secure settings, not committed files.

## Required Vercel runtime
- DATABASE_URL
- JWT_SECRET
- ADMIN_TOKEN
- CRON_SECRET

## Optional features and tuning
- AD_ADMIN_CODE
- LOG_LEVEL
- RESEND_API_KEY
- OPENAI_API_KEY
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- VIDEO_SESSION_IDLE_TIMEOUT_MINUTES
- RSS_CRON_BATCH_SIZE

Stripe payments/webhooks and email require their corresponding names when those
features are enabled. Preserve the existing JWT secret only through a separate
secure transfer if token continuity is needed; nothing is extracted here.

## Platform/build supplied or optional
- NODE_ENV
- VERCEL_URL
- VITE_API_URL
- BASE_PATH
- BASE_URL

The API uses same-origin URLs by default. Do not put private credentials in any
frontend-prefixed variable. Vercel supplies its deployment hostname; Vite
supplies its base URL. The exported Vite config fixes the website base path.

## Local migration/export tools only
- TARGET_DATABASE_URL
- SOURCE_DATABASE_URL
- PGOPTIONS

The target tools deliberately do not fall back to the application DATABASE_URL.
Use a direct/non-pooled target connection for migrations and restoration if the
managed provider recommends it. Use its pooled connection for runtime requests.
Require TLS as directed by the database provider.

## Retained standalone source, not needed by Vercel
- PORT
- API_INTERNAL_PORT

## Historical Replit provisioning helpers only, not needed by Vercel
- REPLIT_CONNECTORS_HOSTNAME
- REPL_IDENTITY
- WEB_REPL_RENEWAL

## Standard local operating-system variables used by the optional smoke test
- PATH
- HOME

Replit identity, deployment and connector variables are not needed on the target.
Do not copy any Replit connector token or session identity into Vercel.
