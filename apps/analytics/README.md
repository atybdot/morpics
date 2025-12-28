```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## GitHub Actions

This worker is automatically deployed via GitHub Actions on push to main branch.

### Required Secrets

Configure these secrets in your GitHub repository settings:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token (create at https://dash.cloudflare.com/profile/api-tokens)
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID (find at https://dash.cloudflare.com)

### Creating API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template or create custom token with:
   - Account - Workers Scripts - Edit permissions
4. Copy the generated token to your GitHub secrets

### Finding Account ID

1. Go to https://dash.cloudflare.com
2. Select your account on the right sidebar
3. Scroll to the bottom and find the "API" section
4. Copy the Account ID


```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
