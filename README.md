# Dryad Restoration App

A comprehensive management system for restoration companies to track jobs, customers, quotes, and more.

## Development

Once you've cloned the project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## User Roles and Task Permissions

The application supports different user roles with specific permissions:

### User Roles

1. **Admin** - Full access to all features and functionality
2. **Office** - Access to administrative functions, job management, and customer records
3. **Technician** - Field access to assigned jobs and related tasks
4. **Customer** - Limited access to view their own jobs and communicate with the team

### Task System 

The job workflow is organized into status-specific tasks that can only be performed by users with the appropriate role:

#### Job Status Flow
- **NEW** → **SCHEDULED** → **IN_PROGRESS** → **PENDING_COMPLETION** → **COMPLETED** → **INVOICED** → **PAID**

#### Role-based Task Permissions

| Job Status | Task | Required Role | Description |
|------------|------|---------------|-------------|
| NEW | Schedule Job | Office, Admin | Set the job start date |
| NEW | Assign Technicians | Office, Admin | Assign technicians to the job |
| SCHEDULED | Confirm Dispatch | Office, Admin | Confirm technicians were dispatched |
| IN_PROGRESS | Log Final Readings | Technician | Log moisture readings from the job site |
| IN_PROGRESS | Upload "After" Photos | Technician | Upload photos of the completed work |
| IN_PROGRESS | Confirm Equipment Removed | Technician | Confirm all equipment was removed |
| IN_PROGRESS | Submit for Office Review | Technician | Mark the job as ready for review |
| PENDING_COMPLETION | Review Checklist | Office, Admin | Review the technician's work |
| PENDING_COMPLETION | Enter Labor | Office, Admin | Enter labor hours for the job |
| PENDING_COMPLETION | Finalize Job | Office, Admin | Mark the job as complete |
| COMPLETED | Generate Invoice | Office, Admin | Generate an invoice for the job |
| INVOICED | Record Payment | Office, Admin | Record payment for the job |

### Task Dependencies

Some tasks require other tasks to be completed first:

- **Submit for Office Review** requires all other technician tasks to be completed first
- Advancing from **NEW** to **SCHEDULED** requires job scheduling and technician assignment
- Advancing from **SCHEDULED** to **IN_PROGRESS** requires dispatch confirmation
- Advancing from **IN_PROGRESS** to **PENDING_COMPLETION** requires all technician tasks to be completed

## Using the User Switcher

The application includes a user switcher in the navigation bar to easily test different user roles:

1. Select a user from the dropdown to switch roles
2. The interface and available tasks will update based on the selected user's role
3. This helps with testing role-based permissions without having to log out and log back in

## Deploying to Vercel

This app is configured for deployment on Vercel.

### Setup

1. Create an account on [Vercel](https://vercel.com) if you don't already have one
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Log in to Vercel from the CLI:
   ```bash
   vercel login
   ```

### Environment Variables

Make sure to set up your environment variables in the Vercel dashboard. You can use `.env.example` as a reference for the required variables.

### Deployment

#### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Import your repository in the Vercel dashboard
3. Configure the project and environment variables
4. Deploy

#### Option 2: Deploy from CLI

```bash
# For a preview deployment
vercel

# For a production deployment
vercel --prod
```

The application uses `@sveltejs/adapter-vercel` for optimal deployment on the Vercel platform.

## Features

- Customer management
- Quote creation and tracking
- Job management
- Task workflow system with role-based permissions
- Field technician mobile interface
- Project tracking
- Activity logging
- Equipment tracking
- Responsive interface built with Tailwind CSS
