# 🚀 Alhamd Foundation Website — Live Karne Ka Mukammal Guide

Yeh website **Next.js + PostgreSQL** par bani hai. Isko FREE live karne ka sab se
asaan tareeqa: **Vercel** (website hosting) + **Neon** (database). Dono free hain,
credit card ki zaroorat nahi. Total waqt: ~15 minute.

---

## ✅ Step 1 — Code ko GitHub par upload karein (3 min)

1. https://github.com par account banayein (agar nahi hai).
2. Naya repository banayein: naam `alhamd-foundation`, **Private** rakhein.
3. Is project ka poora folder upload karein:
   - **Option A (asaan):** GitHub Desktop install karein → "Add local repository" → Publish.
   - **Option B (terminal):**
     ```bash
     git init
     git add .
     git commit -m "Alhamd Foundation website"
     git branch -M main
     git remote add origin https://github.com/APKA-USERNAME/alhamd-foundation.git
     git push -u origin main
     ```
   > ⚠️ `.env` file khud-ba-khud upload NAHI hogi (`.gitignore` mein hai) — yeh sahi hai.

---

## ✅ Step 2 — Free Database banayein (Neon) (3 min)

1. https://neon.tech par jayein → **Sign up with GitHub**.
2. **New Project** → Name: `alhamd-foundation` → Region: **Singapore (ap-southeast-1)** (Pakistan ke qareeb) → Create.
3. Dashboard par **Connection string** copy karein. Woh kuch aisi hogi:
   ```
   postgresql://neondb_owner:XXXXXXXX@ep-cool-name-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
   > 💡 "**Pooled connection**" wali string select karein (jis mein `-pooler` likha ho).

---

## ✅ Step 3 — Database tables banayein (2 min)

Apne computer par project folder mein terminal kholein aur yeh chalayein
(`<CONNECTION-STRING>` ki jagah Step 2 wali string paste karein):

```bash
npm install
DATABASE_URL="<CONNECTION-STRING>" npx drizzle-kit push
```

Windows (PowerShell) par:
```powershell
npm install
$env:DATABASE_URL="<CONNECTION-STRING>"; npx drizzle-kit push
```

`[✓] Changes applied` aana chahiye. Bas — saari tables ban gayin.
(143 reviews aur rashan items pehli visit par khud add ho jayenge.)

---

## ✅ Step 4 — Vercel par deploy karein (5 min)

1. https://vercel.com par jayein → **Sign up with GitHub**.
2. **Add New → Project** → apni `alhamd-foundation` repository **Import** karein.
3. **Environment Variables** section mein add karein:
   | Name           | Value                                  |
   |----------------|----------------------------------------|
   | `DATABASE_URL` | Step 2 wali poori connection string     |
4. **Deploy** dabayein. 1–2 minute mein aap ki site live:
   `https://alhamd-foundation.vercel.app` (ya milta-julta naam)

🎉 **Mubarak ho — website live hai!**

---

## ✅ Step 5 — Live hone ke baad zaroori kaam (5 min)

Website kholein → `/admin` par jayein → password: `alhamd2012`

1. **⚙️ Site Settings → 🔐 Admin Security** → **naya mazboot password** rakhein (sab se pehle!).
2. **⚙️ Site Settings → 💳 Payment Method** → apna asli JazzCash/EasyPaisa/Bank number, title daalein.
3. **✉️ Email & Notifications**:
   - Gmail (`alhamdfoundation2012@gmail.com`) → Google Account → Security → **2-Step Verification ON** karein.
   - Search "**App passwords**" → app name `Alhamd Website` → Create → **16-letter code** copy karein.
   - Admin panel mein woh code **Gmail App Password** field mein paste karein → toggle **ENABLED (Live)** karein → **Save** → **Send Test** se check karein.
4. **🖼️ Website Images** → apni asli tasveerein (rashan distribution, students) upload karein.
5. **🛒 Rashan Items** → market ke mutabiq prices update karein.

---

## 🌐 Apna Domain lagana (optional) — e.g. `alhamdfoundation.org`

1. Domain kharidein: **Namecheap.com** (~$10/saal) ya Pakistani `.pk` ke liye **PKNIC**.
2. Vercel → apna project → **Settings → Domains** → domain type karein → Add.
3. Vercel jo **DNS records** dikhaye (A record `76.76.21.21` aur CNAME `cname.vercel-dns.com`)
   unhein domain provider ke DNS settings mein daal dein.
4. 10–30 minute mein `https://alhamdfoundation.org` chal jayega (SSL free & automatic).

---

## 🔄 Future mein site update kaise karein?

Code mein koi bhi tabdeeli kar ke GitHub par `git push` karein — Vercel **khud-ba-khud**
1 minute mein nayi version live kar deta hai. Content (text, prices, images, payment)
ke liye code ki zaroorat hi nahi — sab **Admin Panel** se hota hai.

---

## 🆘 Masail (Troubleshooting)

| Masla | Hal |
|---|---|
| Site khulti hai lekin data nahi / error 500 | Vercel → Settings → Environment Variables mein `DATABASE_URL` check karein, phir **Redeploy** |
| `drizzle-kit push` fail | Connection string ke aakhir mein `?sslmode=require` zaroor ho |
| Email nahi ja rahi | Gmail ka **App Password** (16 letters) use karein, normal password nahi; 2-Step Verification ON ho |
| Admin password bhool gaye | Neon → SQL Editor: `DELETE FROM settings WHERE key='admin_password';` → password wapas `alhamd2012` |
| Images upload nahi ho rahi | 5 MB se choti JPG/PNG use karein |

---

**Alhamd Foundation** • alhamdfoundation2012@gmail.com • Serving Humanity Since 2012
