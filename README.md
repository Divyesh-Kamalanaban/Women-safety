# Women Safety Analytics Platform

A real-time safety intelligence platform that uses location data to provide risk analysis and alerts for women traveling alone.

## Features
- **Real-time Risk Analysis**: Calculates safety scores based on recent incidents in your immediate area (~2km radius).
- **Live Location Tracking**: Share your status and see nearby verified users.
- **Incident Reporting**: Report safety hazards anonymously.
- **Heatmap Visualization**: View high-risk zones on an interactive map.

## Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: SQLite with [Prisma ORM](https://www.prisma.io/)
- **Maps**: Leaflet / React-Leaflet
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm, pnpm, or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd Women-safety
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   This project uses a local SQLite database (`dev.db`). You must initialize it before running the app.
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database (creates dev.db)
   npx prisma db push
   
   # (Optional) Seed with sample data
   # You can create a GET request to /api/seed if a seeder is implemented, 
   # or manually add data via 'npx prisma studio'
   ```

4. **Environment Variables**
   Create a `.env` file in the root directory (optional, defaults provided in code usually, but good practice):
   ```env
   DATABASE_URL="file:./dev.db"
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: The application requires **Location Permissions**. You must allow location access to view the dashboard. If you deny it, the application will not load the safety data.

## Project Structure
- `src/app/api`: Backend API routes (Risk analysis, Incidents, Auth).
- `src/components`: Reusable UI components (MapWrapper, ReportForm).
- `src/lib`: Utility functions (Risk algorithm, Prisma client).
