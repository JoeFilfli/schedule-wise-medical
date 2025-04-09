# 🏥 Hospital Web App

A full-featured, role-based hospital management system built with **Next.js 14 (App Router)**, **Prisma**, **PostgreSQL**, **Bootstrap**, and **NextAuth**.
---

## 🚀 Tech Stack

- ⚙️ **Next.js 14** (App Router, SSR, Client/Server components)
- 💾 **Prisma ORM** (PostgreSQL)
- 🔐 **NextAuth.js** (JWT-based authentication)
- 🗓 **react-big-calendar**
- 💅 **Bootstrap 5** (UI styling)
- 🌐 **TypeScript**

---

## 📦 Setup Instructions

### 1. Clone the Repo

```
git clone [https://github.com/your-username/hospital-app.git](https://github.com/your-username/schedule-wise-medical.git)
cd schedule-wise-mdeical

```
### 2.Install Dependencies
```
npm install

```

### 3. Environment Variables
Create a .env file:

```
DATABASE_URL="postgresql://youruser:yourpass@localhost:5432/hospital_db"
NEXTAUTH_SECRET="your-long-secret-key"
```

### 4. Prisma Setup
Push schema to your DB and generate client:

```
npx prisma db push
npx prisma generate

```

### 5. Run the App

```
npm run dev

```
Visit http://localhost:3000