"""
Known API templates — instant registration when a credential is detected.
Each entry maps a credential pattern to a pre-configured API definition.
The agent uses these to skip discovery for common services.
"""

KNOWN_APIS = {
    # ── Payment / Finance ────────────────────────────────────────────────────
    "stripe": {
        "detect_prefix": ["sk_live_", "sk_test_", "rk_live_", "rk_test_"],
        "detect_keywords": ["stripe"],
        "name": "stripe",
        "base_url": "https://api.stripe.com/v1",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Stripe payments API — charges, customers, subscriptions, invoices",
        "docs_url": "https://stripe.com/docs/api",
        "endpoints": [
            {"method": "GET", "path": "/charges", "desc": "List charges"},
            {"method": "POST", "path": "/charges", "desc": "Create a charge"},
            {"method": "GET", "path": "/customers", "desc": "List customers"},
            {"method": "POST", "path": "/customers", "desc": "Create customer"},
            {"method": "GET", "path": "/subscriptions", "desc": "List subscriptions"},
            {"method": "GET", "path": "/balance", "desc": "Get account balance"},
            {"method": "GET", "path": "/invoices", "desc": "List invoices"},
            {"method": "GET", "path": "/products", "desc": "List products"},
            {"method": "GET", "path": "/prices", "desc": "List prices"},
        ],
    },

    # ── Cloud / Hosting ──────────────────────────────────────────────────────
    "vercel": {
        "detect_prefix": ["ver_", "bearer_"],
        "detect_keywords": ["vercel"],
        "name": "vercel",
        "base_url": "https://api.vercel.com",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Vercel platform API — deployments, projects, domains, env vars",
        "docs_url": "https://vercel.com/docs/rest-api",
        "endpoints": [
            {"method": "GET", "path": "/v9/projects", "desc": "List projects"},
            {"method": "GET", "path": "/v6/deployments", "desc": "List deployments"},
            {"method": "POST", "path": "/v13/deployments", "desc": "Create deployment"},
            {"method": "GET", "path": "/v5/domains", "desc": "List domains"},
            {"method": "GET", "path": "/v2/user", "desc": "Get current user"},
        ],
    },
    "cloudflare": {
        "detect_prefix": [],
        "detect_keywords": ["cloudflare", "cf_"],
        "name": "cloudflare",
        "base_url": "https://api.cloudflare.com/client/v4",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Cloudflare API — DNS, zones, workers, pages, tunnels",
        "docs_url": "https://developers.cloudflare.com/api",
        "endpoints": [
            {"method": "GET", "path": "/zones", "desc": "List zones"},
            {"method": "GET", "path": "/zones/{zone_id}/dns_records", "desc": "List DNS records"},
            {"method": "POST", "path": "/zones/{zone_id}/dns_records", "desc": "Create DNS record"},
            {"method": "GET", "path": "/user", "desc": "Get current user"},
            {"method": "GET", "path": "/accounts", "desc": "List accounts"},
            {"method": "GET", "path": "/zones/{zone_id}/workers/routes", "desc": "List worker routes"},
        ],
    },
    "digitalocean": {
        "detect_prefix": ["dop_v1_", "doo_v1_"],
        "detect_keywords": ["digitalocean", "do_api"],
        "name": "digitalocean",
        "base_url": "https://api.digitalocean.com/v2",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "DigitalOcean API — droplets, domains, databases, apps, spaces",
        "docs_url": "https://docs.digitalocean.com/reference/api/",
        "endpoints": [
            {"method": "GET", "path": "/droplets", "desc": "List droplets"},
            {"method": "POST", "path": "/droplets", "desc": "Create droplet"},
            {"method": "GET", "path": "/domains", "desc": "List domains"},
            {"method": "GET", "path": "/databases", "desc": "List databases"},
            {"method": "GET", "path": "/apps", "desc": "List apps"},
            {"method": "GET", "path": "/account", "desc": "Get account info"},
            {"method": "GET", "path": "/sizes", "desc": "List droplet sizes"},
        ],
    },
    "railway": {
        "detect_prefix": [],
        "detect_keywords": ["railway"],
        "name": "railway",
        "base_url": "https://backboard.railway.com/graphql/v2",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Railway deployment platform (GraphQL API)",
        "docs_url": "https://docs.railway.com/reference/public-api",
        "endpoints": [
            {"method": "POST", "path": "", "desc": "GraphQL endpoint — query projects, services, deployments"},
        ],
    },

    # ── Dev Tools / SCM ──────────────────────────────────────────────────────
    "github_api": {
        "detect_prefix": ["ghp_", "github_pat_", "gho_"],
        "detect_keywords": ["github_api", "github api"],
        "name": "github_api",
        "base_url": "https://api.github.com",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "GitHub REST API — repos, issues, PRs, actions, users",
        "docs_url": "https://docs.github.com/en/rest",
        "endpoints": [
            {"method": "GET", "path": "/user", "desc": "Get authenticated user"},
            {"method": "GET", "path": "/user/repos", "desc": "List your repos"},
            {"method": "GET", "path": "/repos/{owner}/{repo}", "desc": "Get repo"},
            {"method": "GET", "path": "/repos/{owner}/{repo}/issues", "desc": "List issues"},
            {"method": "POST", "path": "/repos/{owner}/{repo}/issues", "desc": "Create issue"},
            {"method": "GET", "path": "/repos/{owner}/{repo}/pulls", "desc": "List PRs"},
            {"method": "GET", "path": "/repos/{owner}/{repo}/actions/runs", "desc": "List workflow runs"},
        ],
    },
    "linear": {
        "detect_prefix": ["lin_api_"],
        "detect_keywords": ["linear"],
        "name": "linear",
        "base_url": "https://api.linear.app/graphql",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "",
        "description": "Linear project management (GraphQL API)",
        "docs_url": "https://developers.linear.app/docs/graphql/working-with-the-graphql-api",
        "endpoints": [
            {"method": "POST", "path": "", "desc": "GraphQL endpoint — issues, projects, teams, cycles"},
        ],
    },

    # ── Communication ────────────────────────────────────────────────────────
    "sendgrid": {
        "detect_prefix": ["SG."],
        "detect_keywords": ["sendgrid"],
        "name": "sendgrid",
        "base_url": "https://api.sendgrid.com/v3",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "SendGrid email API — send emails, manage contacts, templates",
        "docs_url": "https://docs.sendgrid.com/api-reference",
        "endpoints": [
            {"method": "POST", "path": "/mail/send", "desc": "Send email"},
            {"method": "GET", "path": "/templates", "desc": "List templates"},
            {"method": "GET", "path": "/marketing/contacts", "desc": "List contacts"},
        ],
    },
    "resend": {
        "detect_prefix": ["re_"],
        "detect_keywords": ["resend"],
        "name": "resend",
        "base_url": "https://api.resend.com",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Resend email API — send transactional emails",
        "docs_url": "https://resend.com/docs/api-reference",
        "endpoints": [
            {"method": "POST", "path": "/emails", "desc": "Send email"},
            {"method": "GET", "path": "/emails/{id}", "desc": "Get email status"},
            {"method": "GET", "path": "/domains", "desc": "List domains"},
            {"method": "GET", "path": "/api-keys", "desc": "List API keys"},
        ],
    },
    "twilio": {
        "detect_prefix": ["SK", "AC"],
        "detect_keywords": ["twilio"],
        "name": "twilio",
        "base_url": "https://api.twilio.com/2010-04-01",
        "auth_type": "basic",
        "auth_header": "Authorization",
        "auth_prefix": "Basic ",
        "description": "Twilio — SMS, voice calls, WhatsApp messaging",
        "docs_url": "https://www.twilio.com/docs/usage/api",
        "endpoints": [
            {"method": "POST", "path": "/Accounts/{sid}/Messages.json", "desc": "Send SMS/WhatsApp"},
            {"method": "GET", "path": "/Accounts/{sid}/Messages.json", "desc": "List messages"},
            {"method": "GET", "path": "/Accounts/{sid}/Calls.json", "desc": "List calls"},
        ],
    },

    # ── AI / ML ──────────────────────────────────────────────────────────────
    "replicate": {
        "detect_prefix": ["r8_"],
        "detect_keywords": ["replicate"],
        "name": "replicate",
        "base_url": "https://api.replicate.com/v1",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Replicate — run ML models (image gen, LLMs, video, audio)",
        "docs_url": "https://replicate.com/docs/reference/http",
        "endpoints": [
            {"method": "POST", "path": "/predictions", "desc": "Run a model"},
            {"method": "GET", "path": "/predictions/{id}", "desc": "Get prediction status"},
            {"method": "GET", "path": "/models", "desc": "List models"},
            {"method": "GET", "path": "/collections", "desc": "List collections"},
        ],
    },
    "stability": {
        "detect_prefix": ["sk-"],
        "detect_keywords": ["stability", "stable diffusion", "stabilitiai"],
        "name": "stability",
        "base_url": "https://api.stability.ai/v1",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Stability AI — image generation (Stable Diffusion)",
        "docs_url": "https://platform.stability.ai/docs/api-reference",
        "endpoints": [
            {"method": "POST", "path": "/generation/{engine_id}/text-to-image", "desc": "Generate image from text"},
            {"method": "GET", "path": "/engines/list", "desc": "List available engines"},
            {"method": "GET", "path": "/user/balance", "desc": "Get credit balance"},
        ],
    },

    # ── Monitoring / Analytics ────────────────────────────────────────────────
    "sentry": {
        "detect_prefix": ["sntrys_"],
        "detect_keywords": ["sentry"],
        "name": "sentry",
        "base_url": "https://sentry.io/api/0",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Sentry error tracking API — issues, events, projects",
        "docs_url": "https://docs.sentry.io/api/",
        "endpoints": [
            {"method": "GET", "path": "/projects/", "desc": "List projects"},
            {"method": "GET", "path": "/projects/{org}/{project}/issues/", "desc": "List issues"},
            {"method": "GET", "path": "/organizations/", "desc": "List organizations"},
        ],
    },
    "uptimerobot": {
        "detect_prefix": ["ur_", "u"],
        "detect_keywords": ["uptimerobot", "uptime robot"],
        "name": "uptimerobot",
        "base_url": "https://api.uptimerobot.com/v2",
        "auth_type": "body",
        "auth_header": "",
        "auth_prefix": "",
        "description": "UptimeRobot — monitor uptime, get alerts",
        "docs_url": "https://uptimerobot.com/api/",
        "endpoints": [
            {"method": "POST", "path": "/getMonitors", "desc": "List monitors"},
            {"method": "POST", "path": "/newMonitor", "desc": "Create monitor"},
            {"method": "POST", "path": "/getAlertContacts", "desc": "List alert contacts"},
        ],
    },

    # ── Storage / Database ────────────────────────────────────────────────────
    "supabase": {
        "detect_prefix": ["sbp_", "eyJ"],
        "detect_keywords": ["supabase"],
        "name": "supabase",
        "base_url": "",  # needs project URL
        "auth_type": "header",
        "auth_header": "apikey",
        "auth_prefix": "",
        "description": "Supabase — Postgres database, auth, storage, realtime",
        "docs_url": "https://supabase.com/docs/guides/api",
        "endpoints": [
            {"method": "GET", "path": "/rest/v1/{table}", "desc": "Query table rows"},
            {"method": "POST", "path": "/rest/v1/{table}", "desc": "Insert rows"},
            {"method": "GET", "path": "/auth/v1/user", "desc": "Get current user"},
        ],
    },
    "firebase": {
        "detect_prefix": ["AIza"],
        "detect_keywords": ["firebase"],
        "name": "firebase",
        "base_url": "https://firestore.googleapis.com/v1",
        "auth_type": "query",
        "auth_header": "",
        "auth_prefix": "",
        "description": "Firebase/Firestore — document database, auth",
        "docs_url": "https://firebase.google.com/docs/firestore/use-rest-api",
        "endpoints": [
            {"method": "GET", "path": "/projects/{project}/databases/(default)/documents/{collection}", "desc": "List documents"},
        ],
    },

    # ── DNS / Domain ─────────────────────────────────────────────────────────
    "namecheap": {
        "detect_prefix": [],
        "detect_keywords": ["namecheap"],
        "name": "namecheap",
        "base_url": "https://api.namecheap.com/xml.response",
        "auth_type": "query",
        "auth_header": "",
        "auth_prefix": "",
        "description": "Namecheap — domain registration, DNS management",
        "docs_url": "https://www.namecheap.com/support/api/intro/",
        "endpoints": [
            {"method": "GET", "path": "?ApiUser={user}&ApiKey={key}&Command=namecheap.domains.getList", "desc": "List domains"},
        ],
    },

    # ── Misc ─────────────────────────────────────────────────────────────────
    "notion": {
        "detect_prefix": ["secret_", "ntn_"],
        "detect_keywords": ["notion"],
        "name": "notion",
        "base_url": "https://api.notion.com/v1",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Notion API — pages, databases, blocks, search",
        "docs_url": "https://developers.notion.com/reference",
        "endpoints": [
            {"method": "POST", "path": "/search", "desc": "Search pages/databases"},
            {"method": "GET", "path": "/databases/{id}/query", "desc": "Query database"},
            {"method": "GET", "path": "/pages/{id}", "desc": "Get page"},
            {"method": "POST", "path": "/pages", "desc": "Create page"},
            {"method": "GET", "path": "/users/me", "desc": "Get current bot user"},
        ],
    },
    "airtable": {
        "detect_prefix": ["pat"],
        "detect_keywords": ["airtable"],
        "name": "airtable",
        "base_url": "https://api.airtable.com/v0",
        "auth_type": "bearer",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
        "description": "Airtable — spreadsheet/database API",
        "docs_url": "https://airtable.com/developers/web/api/introduction",
        "endpoints": [
            {"method": "GET", "path": "/meta/bases", "desc": "List bases"},
            {"method": "GET", "path": "/{baseId}/{tableId}", "desc": "List records"},
            {"method": "POST", "path": "/{baseId}/{tableId}", "desc": "Create records"},
        ],
    },
    "shopify": {
        "detect_prefix": ["shpat_", "shppa_"],
        "detect_keywords": ["shopify"],
        "name": "shopify",
        "base_url": "",  # needs store URL
        "auth_type": "header",
        "auth_header": "X-Shopify-Access-Token",
        "auth_prefix": "",
        "description": "Shopify Admin API — products, orders, customers",
        "docs_url": "https://shopify.dev/docs/api/admin-rest",
        "endpoints": [
            {"method": "GET", "path": "/admin/api/2024-01/products.json", "desc": "List products"},
            {"method": "GET", "path": "/admin/api/2024-01/orders.json", "desc": "List orders"},
            {"method": "GET", "path": "/admin/api/2024-01/customers.json", "desc": "List customers"},
        ],
    },
}


def detect_api_from_key(key_value: str, hint: str = "") -> dict | None:
    """Try to detect which API a key belongs to based on prefix and hint keywords.
    Returns the KNOWN_APIS entry if matched, else None.
    """
    key_value = (key_value or "").strip()
    hint_lower = (hint or "").lower()

    for api_name, api_def in KNOWN_APIS.items():
        # Check prefix match
        for prefix in api_def.get("detect_prefix", []):
            if key_value.startswith(prefix):
                return api_def

        # Check keyword match in hint
        for kw in api_def.get("detect_keywords", []):
            if kw in hint_lower:
                return api_def

    return None
