# Custom Domain Setup Guide

Complete process for migrating a Railway-deployed Next.js app (with Clerk auth and Cloudflare R2) to a custom domain purchased on Namecheap. Includes email routing via Cloudflare.

---

## Overview

**Services involved:**
- Namecheap — domain registrar
- Railway — app hosting
- Clerk — authentication
- Cloudflare — DNS management + email routing
- Cloudflare R2 — file storage

---

## Phase 1: Add Custom Domain in Railway

1. Go to **Railway Dashboard → Your Service → Settings → Networking → Custom Domain**
2. Enter your domain (e.g. `fleetpulse.space`)
3. Railway will give you a **CNAME record** to point to (e.g. `your-app.railway.internal`)
4. Note this CNAME value — you'll need it in the next step

---

## Phase 2: Move DNS from Namecheap to Cloudflare

> Moving to Cloudflare is required for email routing. It also gives you faster DNS, basic DDoS protection, and bot filtering on the free tier.

### 2.1 Add domain to Cloudflare

1. Create a free account at cloudflare.com
2. Click **Add a Site** → enter your domain → select **Free plan**
3. Cloudflare scans and imports your existing DNS records automatically
4. Note the two Cloudflare nameservers assigned (e.g. `arnold.ns.cloudflare.com`, `ryleigh.ns.cloudflare.com`)

### 2.2 Change nameservers in Namecheap

1. Log into Namecheap → **Domain List → Manage** (next to your domain)
2. Under **Nameservers**, change dropdown from **Namecheap BasicDNS** to **Custom DNS**
3. Enter both Cloudflare nameservers
4. Delete the old Namecheap nameservers (`dns1.registrar-servers.com`, `dns2.registrar-servers.com`)
5. Save (green checkmark)

> Nameserver propagation takes a few minutes to a few hours.

### 2.3 Add Railway CNAME in Cloudflare

1. **Cloudflare → DNS → Records → Add record**

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| CNAME | `@` or `www` | Your Railway CNAME value | DNS only (grey cloud) |

> **Important:** Set proxy to **DNS only (grey cloud)** — not orange. Railway manages its own SSL and proxying can interfere.

---

## Phase 3: Update Railway Environment Variables

In **Railway → Your Service → Variables**, update:

```
NEXT_PUBLIC_APP_URL=https://yourcustomdomain.com
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

> **Critical:** Dev Clerk keys (`sk_test_*` / `pk_test_*`) must be replaced with production keys (`sk_live_*` / `pk_live_*`). Using dev keys in production causes auth issues including test-only emails not working.

Get production Clerk keys from: **Clerk Dashboard → (switch to Production instance) → API Keys**

After updating variables, redeploy:

```bash
railway up
```

---

## Phase 4: Configure Clerk for Production Domain

### 4.1 Create Production Instance in Clerk

1. **Clerk Dashboard → Settings → Create Production Instance**
2. Enter your custom domain (e.g. `fleetpulse.space`)
3. Click **Create Instance**

> If you see "You can only have one production instance", you already have one. Navigate to it from the Clerk dashboard home page.

### 4.2 Complete DNS Configuration (5 CNAME Records)

Clerk production requires **5 CNAME records** for full functionality. Go to **Clerk Dashboard → Production → Developers → Domains** to see the exact values for your instance.

In **Cloudflare → DNS → Add record**, add all 5 records:

| Type | Name | Target | Purpose |
|------|------|--------|---------|
| CNAME | `clerk` | `frontend-api.clerk.services` | Frontend API (serves clerk.browser.js) |
| CNAME | `accounts` | `accounts.clerk.services` | Account portal |
| CNAME | `clkmail` | `mail.{instance-id}.clerk.services` | Email sending |
| CNAME | `clk._domainkey` | `dkim1.{instance-id}.clerk.services` | Email DKIM signature |
| CNAME | `clk2._domainkey` | `dkim2.{instance-id}.clerk.services` | Email DKIM signature (backup) |

> **Important:** The `{instance-id}` is unique to your Clerk instance. Copy the exact values from your Clerk dashboard — don't use generic `dkim1.clerk.services`.

> **Important:** Set all records to **DNS only (grey cloud)** — not proxied (orange cloud).

### 4.3 Verify DNS in Clerk

1. After adding all 5 records, go to **Clerk Dashboard → Domains → DNS Configuration**
2. Click **Verify configuration**
3. Wait for all 5 records to show **Verified** (green checkmark)

If verification fails, DNS might still be propagating. Wait a few minutes and try again.

### 4.4 Verify DNS Propagation Locally

```bash
dig clerk.yourdomain.com @1.1.1.1
```

You should see a CNAME chain resolving to Clerk's servers. If `NXDOMAIN` locally but resolves via `@1.1.1.1`, flush local DNS cache:

```bash
# macOS
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

### 4.5 Add authorizedParties (Security)

In your `src/middleware.ts`, add `authorizedParties` to prevent subdomain cookie attacks:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/trpc(.*)",
]);

export default clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  { authorizedParties: ['https://yourdomain.com'] }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

> **Important:** The file must be named `middleware.ts` (not `proxy.ts` or anything else) for Next.js to auto-load it.

### 4.6 Update Content Security Policy (CSP)

If your app has a Content Security Policy in `next.config.ts`, you must allow Clerk's production subdomains and Cloudflare Turnstile (used for bot protection on sign-up). Update the CSP:

```typescript
// next.config.ts
const securityHeaders = [
    // ... other headers
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            // Clerk subdomains + Cloudflare Turnstile for bot protection
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.yourdomain.com https://accounts.yourdomain.com https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' blob: data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://api.clerk.dev https://*.clerk.accounts.dev https://clerk.yourdomain.com https://accounts.yourdomain.com https://api.clerk.com",
            "worker-src 'self' blob:",
            "frame-src 'self' https://challenges.cloudflare.com", // Turnstile iframe
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'",
        ].join('; '),
    },
];
```

**Required CSP domains for Clerk production:**
| Domain | Purpose |
|--------|---------|
| `clerk.yourdomain.com` | Frontend API, serves clerk.browser.js |
| `accounts.yourdomain.com` | Account portal |
| `challenges.cloudflare.com` | Turnstile bot protection (sign-up) |

> **Important:** Without updating CSP, the browser will block Clerk scripts from loading, causing auth to fail silently.

---

## Phase 5: Update Cloudflare R2 CORS

In **Cloudflare R2 Dashboard → Bucket → Settings → CORS**, update to include your new domain:

```json
[
  {
    "AllowedOrigins": ["https://yourcustomdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Phase 6: Set Up Email Routing (Cloudflare — Free)

> Cloudflare Email Routing forwards emails from `anything@yourdomain.com` to an existing personal email. It doesn't create a real mailbox but is free and works well for solo projects.

### 6.1 Delete Old Namecheap Email Records (if migrating)

If your domain was previously using Namecheap's email forwarding, you must delete the old records first. Cloudflare will show "Email DNS records: Misconfigured" until these are removed.

**Delete these conflicting records from Cloudflare DNS:**

| Type | Name | Value (pattern) |
|------|------|-----------------|
| MX | @ | `eforward1.registrar-servers.com` |
| MX | @ | `eforward2.registrar-servers.com` |
| MX | @ | `eforward3.registrar-servers.com` |
| MX | @ | `eforward4.registrar-servers.com` |
| MX | @ | `eforward5.registrar-servers.com` |
| TXT | @ | `v=spf1 include:spf.efwd.registrar-servers.com ~all` |

> These are Namecheap's email forwarding records that were imported when you moved DNS to Cloudflare. They conflict with Cloudflare's email routing.

### 6.2 Enable Cloudflare Email Routing

1. **Cloudflare Dashboard → Your domain → Email → Email Routing**
2. Click **Get started**
3. Under **Routing Rules → Custom Addresses**, add:
   - Address: `admin@yourdomain.com` (or any alias you want)
   - Action: **Send to** → your personal email address
4. Cloudflare sends a verification email to your personal email — confirm it
5. Cloudflare automatically adds the required MX and TXT records to your DNS

---

## Phase 7: Verify SSL (HTTPS)

Railway provisions SSL automatically via Let's Encrypt once your CNAME is pointing correctly. No manual steps needed.

To verify:

1. **Railway Dashboard → Your Service → Settings → Networking → Custom Domain** — should show green/Certificate Active
2. Or run:

```bash
curl -vI https://yourdomain.com 2>&1 | grep -E "SSL|issuer|expire"
```

The certificate issuer should be **Let's Encrypt**.

---

## Verification Checklist

- [ ] Railway custom domain added and showing Certificate Active
- [ ] Namecheap nameservers changed to Cloudflare
- [ ] Railway CNAME added in Cloudflare (DNS only, grey cloud)
- [ ] `NEXT_PUBLIC_APP_URL` updated in Railway to custom domain
- [ ] Production Clerk keys (`sk_live_*` / `pk_live_*`) set in Railway
- [ ] Clerk production instance created with custom domain
- [ ] All 5 Clerk CNAME records added in Cloudflare:
  - [ ] `clerk` → `frontend-api.clerk.services`
  - [ ] `accounts` → `accounts.clerk.services`
  - [ ] `clkmail` → `mail.{instance-id}.clerk.services`
  - [ ] `clk._domainkey` → `dkim1.{instance-id}.clerk.services`
  - [ ] `clk2._domainkey` → `dkim2.{instance-id}.clerk.services`
- [ ] All 5 DNS records verified in Clerk dashboard (green checkmarks)
- [ ] `authorizedParties` configured in `src/middleware.ts`
- [ ] CSP updated in `next.config.ts` to allow:
  - [ ] `clerk.yourdomain.com`
  - [ ] `accounts.yourdomain.com`
  - [ ] `challenges.cloudflare.com` (Turnstile)
- [ ] R2 CORS updated with new domain
- [ ] Email routing configured and forwarding verified
- [ ] App redeployed after variable changes (`railway up`)
- [ ] Sign-in / sign-up working on new domain

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `clerk.yourdomain.com` not resolving | CNAME not added yet | Add `clerk` CNAME in Cloudflare pointing to `frontend-api.clerk.services` |
| `clerk.browser.js` returns 403 | Clerk DNS not fully verified | Add all 5 CNAME records and verify in Clerk dashboard |
| Sign-in blocked / JS not loading | Clerk subdomain CNAME missing | Add all 5 Clerk CNAME records |
| Auth works on old domain but not new | Using dev Clerk keys in prod | Replace with `sk_live_*` / `pk_live_*` keys |
| `+clerk_test` email "already taken" | Test emails only work on dev instance | Use a real email address on production |
| HTTPS not working | CNAME not yet propagated | Wait for DNS propagation, check Railway dashboard |
| R2 uploads failing | CORS not updated | Add new domain to R2 CORS settings |
| DNS resolves via `@1.1.1.1` but not locally | Local DNS cache stale | Run `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder` |
| Cloudflare proxy breaking Railway SSL | Orange cloud enabled on CNAME | Set CNAME to DNS only (grey cloud) |
| Clerk shows "1/5 Verified" | Missing CNAME records | Check Clerk dashboard for exact records needed, copy instance-specific targets |
| VPN/Tailscale causing DNS failures | VPN intercepting DNS queries | Test with `dig @1.1.1.1`, disconnect VPN, or configure VPN DNS settings |
| `clerk.browser.js` blocked by CSP | CSP doesn't include Clerk subdomain | Add `https://clerk.yourdomain.com` and `https://accounts.yourdomain.com` to `script-src` and `connect-src` |
| `api.js?render=explicit` blocked by CSP | Cloudflare Turnstile blocked | Add `https://challenges.cloudflare.com` to `script-src` and `frame-src` |
| Cloudflare Email Routing "Misconfigured" | Old Namecheap MX/TXT records | Delete all `eforward*.registrar-servers.com` MX records and old SPF TXT record |

---

## Notes

- **Namecheap is just the registrar.** After moving nameservers to Cloudflare, all DNS changes are made in Cloudflare, not Namecheap.
- **Clerk "Inactive" status is normal** until the first real auth request hits the domain.
- **Email routing is forwarding only** — to send email *from* the domain, configure Gmail's "Send as" using an app password, or use a paid service like Zoho Mail or Google Workspace.
- **Cloudflare free tier** handles known bots and basic DDoS automatically. No configuration needed.