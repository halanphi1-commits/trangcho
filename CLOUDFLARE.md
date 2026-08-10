# Cloudflare Pages + D1 setup

This version keeps GitHub as the source repository and deploys the site on
Cloudflare Pages.

## Data flow

```text
Visitor form
  -> /api/register
  -> Cloudflare Pages Function
  -> D1 database

Admin dashboard
  -> /api/admin
  -> Cloudflare Pages Function
  -> D1 database
```

## Required Cloudflare setup

1. Create a Cloudflare Pages project from:

```text
https://github.com/halanphi1-commits/thuytrang
```

2. Use these build settings:

```text
Framework preset: None
Build command: empty
Build output directory: /
Root directory: /
```

3. Create a D1 database named:

```text
thuytrang-db
```

4. Run the schema:

```bash
npx wrangler d1 execute thuytrang-db --file=schema.sql
```

You can also paste `schema.sql` into the Cloudflare dashboard D1 console.

5. Bind the D1 database to the Pages project:

```text
Variable name: DB
Database: thuytrang-db
```

6. Optional but recommended: set environment variables for Admin credentials:

```text
ADMIN_USER=admin
ADMIN_PASS=your-strong-password
```

If these are not set, the Functions use:

```text
admin / CLB2026!
```

## API routes

```text
POST /api/register
POST /api/admin
```

`/api/register` creates or updates a registration by normalized phone number.
If the same phone number submits again, the row is updated and Admin only sees
the latest information.

`/api/admin` supports:

```json
{"action":"list","username":"admin","password":"CLB2026!"}
```

```json
{"action":"clear","username":"admin","password":"CLB2026!"}
```
