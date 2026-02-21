# NutriGenie 🥗

**NutriGenie** is a modern nutritional management platform built with **Next.js 16** and **MongoDB**. It provides personalized meal planning and dietary tracking.

## Technical Architecture

NutriGenie leverages a modern monolithic architecture within the Next.js App Router paradigm.

-   **Frontend**: React Server Components (RSC) by default, with client boundaries for interactivity (forms, auth state).
-   **Backend**: Server Actions and API Routes integrated directly within the Next.js framework.
-   **Database**: MongoDB (NoSQL) with Mongoose ODM for schema validation.
-   **Authentication**: NextAuth.js (v4) handling session management via JWTs and MongoDB storage.

For a detailed architecture breakdown, please see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Tech Stack

-   **Framework**: Next.js 16.1.4 (App Router)
-   **Language**: TypeScript 5.x
-   **Styling**: Tailwind CSS 4
-   **Database**: MongoDB + Mongoose
-   **Authentication**: NextAuth.js
-   **Validation**: Zod + React Hook Form

## Project Structure

```bash
nutrigenie/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Public authentication routes
│   │   ├── (protected)/    # Protected dashboard routes
│   │   ├── api/            # API endpoints (Auth, etc.)
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   ├── lib/                # Shared utilities & configs
│   │   ├── auth/           # NextAuth configuration
│   │   ├── db/             # Database connection logic
│   │   └── validators/     # Zod schemas
│   ├── models/             # Mongoose data models
│   └── middleware.ts       # Route protection middleware
├── public/                 # Static assets
└── ...config files         # Tooling configuration
```

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/nutrigenie.git
    cd nutrigenie
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Open Browser**:
    Visit [http://localhost:3000](http://localhost:3000).

## Contributing

Please follow the coding standards outlined in the documentation.
-   Use **strict mode** TypeScript.
-   Use **Tailwind CSS** for styling.
-   Commit messages should follow conventional commits.
