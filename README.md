# FinTrack - AI-Powered Commercial Loan Management

**FinTrack** is a modern SaaS application designed for tracking commercial loans, calculating installments, and providing AI-driven financial advice. Built with the latest web technologies to ensure a premium user experience.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=FinTrack+Dashboard+Preview)

## 🚀 Features

- **Dashboard**: Real-time overview of Total Debt, Remaining Installments, and Next Payments.
- **Loan Tracking**: Detail view of all loans with amortization schedules.
- **AI Financial Advisor**: Smart suggestions on which loans to pay off first (Avalanche Method).
- **Interactive Charts**: Visual monthly payment projections.
- **Dark Mode**: Fully supported system-wide dark/light themes.
- **Email Notifications**: Automated payment reminders via Resend.
- **Localization**: Full Turkish language support for formatters and UI.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **ORM**: [Prisma](https://prisma.io)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) & [Shadcn/UI](https://ui.shadcn.com)
- **Auth**: Supabase Auth
- **Emails**: [Resend](https://resend.com)
- **Charts**: Recharts

## 📦 Installation

clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/fintrack.git
cd fintrack
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].supabase.co:5432/postgres"

# Auth
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"

# Email
RESEND_API_KEY="re_[your-key]"
```

### Database Setup

Sync the schema and seed the database:

```bash
npx prisma db push
npx prisma db seed
```

## ⚡ Development

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🚀 Deployment

The application is optimized for deployment on **Vercel**.

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add the Environment Variables in Vercel Settings.
4. Deploy!

