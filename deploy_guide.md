# 🚀 BB24 Platform Live Deployment Guide

Apni app ko **24/7 internet par live** karne ke liye aur continuous deployment set up karne ke liye (taaki jab bhi aap code badlein, live website pe automatically change ho jaye), hume ye 3 simple steps follow karne honge:

---

## 📂 Step 1: Push Code to GitHub (Easy Live Updates)
Aapka code jab GitHub par hoga, tab **Vercel** usse directly link ho jayega. Uske baad, **jab bhi aap apne computer pe code change karke push karenge, website live automatically update ho jayegi.**

1. [GitHub](https://github.com/) par account banayein (agar nahi hai).
2. Apne terminal ya Git GUI se ek new **Private Repository** banayein aur code push karein:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - unified persistence"
   git branch -M main
   # GitHub repository link karein:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

## 🗄️ Step 2: Supabase Set Up (Live Database)
Abhi app ka data temporary local storage mein hai. Live website par data save karne ke liye hum Supabase ka permanent database connect karenge.

1. [Supabase](https://supabase.com/) par jaakar login/signup karein (Bilkul Free hai).
2. **"New Project"** par click karein:
   * **Project Name:** `bb24-database`
   * **Database Password:** Koi secure password rakhein.
   * **Region:** `Southeast Asia (Singapore)` select karein (is se India se speed best milegi).
3. Project setup hone mein 2 minute lagenge. Uske baad:
   * **SQL Editor** tab (Left menu mein) par click karein.
   * **"New Query"** par click karein.
   * [supabase/migrations/schema.sql](file:///c:/Users/AS%20Computer/Downloads/Saas/supabase/migrations/schema.sql) file ka sara code copy karke wahan paste karein aur **Run** par click karein. Aapke sare tables (clients, leads, invoices, profiles) ban jayenge.
4. **Project Settings → API** par jayein. Wahan se niche di gayi 2 values copy karein:
   * `Project URL`
   * `API Key` (anon public key)

---

## 🌐 Step 3: Deploy to Vercel (Free Hosting)
Vercel par app host hogi aur live domain milega (jaise `bb24.vercel.app` ya aapka custom domain).

1. [Vercel](https://vercel.com/) par signup karein (Log In with GitHub select karein).
2. **"Add New" → "Project"** par click karein.
3. Apne GitHub account ko authorize karke wahan se apna repository select karke **"Import"** karein.
4. **Environment Variables** section par click karein aur ye do keys add karein (jo aapne Supabase settings se copy ki thi):
   * **Key:** `NEXT_PUBLIC_SUPABASE_URL` | **Value:** *(Aapka Supabase URL)*
   * **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Value:** *(Aapka Supabase Anon Key)*
5. **Deploy** button par click kar dein! 🎉

Aapki site live ho jayegi aur aapko ek link mil jayega (e.g., `https://your-project.vercel.app`).

---

## 🔄 Live Changes Kaise Hote Hain?
Aapko live server par bar-bar deploy karne ki koi zaroorat nahi hai:
1. Jab bhi aap local PC par code mein koi change (CSS, text, features) karenge.
2. Bas change ko commit karke GitHub par push karein:
   ```bash
   git add .
   git commit -m "Added new styling"
   git push origin main
   ```
3. Vercel automatically detect karega ki aapne push kiya hai aur **wo bina website stop kiye 30-45 seconds mein changes ko live update kar dega!**
