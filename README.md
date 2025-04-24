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
git clone [https://github.com/JoeFilfli/hospital-app.git](https://github.com/your-username/schedule-wise-medical.git)
cd schedule-wise-mdeical

```
### 2.Install Dependencies
```
npm install

```

### 3. Environment Variables
Create a `.env` file at the project root with the following (replace values with your own credentials):

```bash
DATABASE_URL="postgresql://postgres:Hello10$@localhost:5432/hospital_db"
NEXTAUTH_SECRET="my_secret_here"
GEMINI_API_KEY=AIzaSyCdIgv_k9otKoJFRkq_ioOGsyNJJhqemdc
NEXTAUTH_URL=http://localhost:3000
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

### 6. Running with Docker

Ensure you have Docker and Docker Compose installed.

Build and start the services:
```bash
docker-compose up --build
```

Access the app at http://localhost:3000.

To run in detached mode:
```bash
docker-compose up -d --build
```

Stop and remove containers:
```bash
docker-compose down
```