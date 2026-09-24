# Alhamd Foundation — Website & Admin Panel

Serving humanity since 2012 · Monthly rashan for families · Scholarships for students.

**Stack:** Next.js (App Router) · PostgreSQL · Drizzle ORM · Tailwind CSS · Nodemailer

## Pages
- `/` Home · `/donate` · `/scholarship` · `/rashan` · `/volunteer` · `/reviews`
- `/admin` — Admin panel (default password `alhamd2012` — change it after first login)

## Local run
```bash
npm install
cp .env.example .env        # set DATABASE_URL
npx drizzle-kit push        # create tables
npm run dev
```

## Go live
👉 Read **[DEPLOY.md](./DEPLOY.md)** — free hosting on Vercel + Neon in ~15 minutes, plus custom domain & Gmail setup.
