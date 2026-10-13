# School Management System Backend

## Prerequisites

- Node.js 22 or newer
- A PostgreSQL database
- SMTP credentials if email notifications are enabled

Run all commands in the `server` directory.

## Environment

Create `server/.env` locally or configure the same variables in the deployment platform. Do not commit this file.

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
SHADOW_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/SHADOW_DATABASE?schema=public
JWT_SECRET=replace-with-at-least-32-random-characters
JWT_REFRESH_SECRET=replace-with-at-least-32-random-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
APP_NAME=School Management System
APP_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-address@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=your-address@gmail.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
# Optional; required only when saving staff bank details. Generate with: node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
STAFF_DATA_ENCRYPTION_KEY=64-character-hex-key
```

`DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` are required. `SHADOW_DATABASE_URL` is only needed when Prisma requires a separate shadow database for development migrations.

SMTP is optional and is used for email notifications. An unavailable SMTP server does not prevent the API from starting, but email notifications will fail until connectivity and credentials are configured. For Gmail, use a Google app password with 2-Step Verification enabled; do not use the normal account password. Port `587` uses STARTTLS, while port `465` uses TLS.

Cloudinary values are required when using the upload endpoints. The server returns `503` for upload requests until all three credentials are configured.
`STAFF_DATA_ENCRYPTION_KEY` must be a randomly generated 32-byte key stored in the deployment secret manager. It is required when an Add Staff request includes bank details. Losing or rotating this key without re-encrypting stored records makes those details unrecoverable.

## Add staff with an account

The full onboarding endpoint is `POST /api/v1/staff` (the existing `POST /staff` remains available). It requires an authenticated administrator with the `staff:write` permission. Submit `multipart/form-data` with:

- `payload`: JSON containing `bioData`, `academics`, `departmentData`, `loginData`, and optional `accountData`.
- `documents`: zero or more certificate files, each up to 10 MB. Set an academic entry's `documentIndex` to the zero-based position of its file in the repeated `documents` fields.

Use the department's database ID in `departmentData.departmentId`; optionally include `facultyId` to verify that the department belongs to that faculty. `bioData.email` and `loginData.email` must match. Do not include `confirmPassword`; the API rejects it. On success, the API creates a staff login account with the `staff` role, generates its staff number, stores qualifications and private certificate references, and sends the existing email-verification flow. The response includes `verificationEmailSent` so the client can detect email delivery problems. Bank name, account number, and BVN are encrypted with AES-256-GCM and are never returned by staff APIs.

The staff-management page uses these administrator endpoints (all require the matching `staff:read` or `staff:write` permission):

- `GET /staff?page=1&limit=20&search=<text>&isActive=true|false` returns a paginated directory with department and course-assignment counts.
- `GET /staff/:id` returns the staff record, department, qualification summaries, linked profile address/date of birth, and course assignments. Bank details and private document IDs are not included.
- `PATCH /staff/:id` updates employee number, name, contact information, position, employment type/date, department, and active status. Send `departmentId: null` to remove the department assignment.
- `DELETE /staff/:id` deletes a staff record unless it still has course offerings; qualification documents are removed from managed storage.
- `GET /staff/export.csv` downloads a CSV export. `POST /staff/import` accepts JSON `{ "csv": "<CSV text>" }` with `employeeNo`, `firstName`, and `lastName` columns required. CSV import creates basic staff records without login accounts.

Example `payload`:

```json
{
  "bioData": {
    "name": "Ada Okafor",
    "email": "ada.okafor@example.com",
    "dob": "1990-04-12",
    "phone": "+2348000000000",
    "address": "12 Example Road"
  },
  "academics": [
    {
      "level": "Tertiary",
      "institution": "Example University",
      "qualification": "B.Sc Mathematics",
      "year": 2012,
      "documentIndex": 0
    }
  ],
  "departmentData": {
    "departmentId": "cm8nc5s8n0000m8f7u0s3t4p5",
    "position": "Lecturer",
    "employmentType": "Full-time",
    "employmentDate": "2026-10-08"
  },
  "loginData": {
    "email": "ada.okafor@example.com",
    "password": "Use-a-unique-password1!"
  }
}
```

This endpoint currently operates in the backend's single-school model. It does not provide SaaS tenant isolation; the authenticated administrator permission check is not a substitute for tenant scoping.

## File uploads

Uploads use `multipart/form-data` with one file field named `file`. The maximum file size is 20 MB; supported formats are JPEG, PNG, WEBP, GIF, and PDF. The server validates file signatures before sending the file to Cloudinary.

- `POST /api/v1/uploads/admission` is public and rate-limited. Admission files are stored in Cloudinary's `school-management/admissions/pending` folder with public delivery so applicants can attach the returned `fileUrl`, `publicId`, `resourceType`, and `claimToken` to their application. The signed claim expires after seven days and prevents attaching someone else's upload by guessing a Cloudinary ID.
- Public clients can load open admission sessions from `GET /api/v1/admissions/options/sessions` and their available classes from `GET /api/v1/admissions/options/classes?academicSessionId=<session-id>`. See [ADMISSION_CLIENT_GUIDE.md](./ADMISSION_CLIENT_GUIDE.md) for the complete client flow and payload contract.
- `POST /api/v1/uploads` requires an authenticated administrator with the `uploads:write` permission. These files use Cloudinary authenticated delivery.

Successful responses include `publicId`, `fileName`, `fileUrl`, `mimeType`, `fileSize`, `resourceType`, and the access mode. Approved admission uploads are tagged `admitted` in Cloudinary; rejecting an application deletes its managed admission uploads. Keep Cloudinary credentials in deployment secrets; never expose the API secret to the frontend.

## Institution settings

The institutional settings endpoints require an authenticated administrator and the permission shown:

- `GET /institution-profile` (`institution:read`) returns the configured profile or `null`.
- `PUT /institution-profile` (`institution:write`) saves the single-school profile: `name` (required), `email`, `address`, `phone`, `logoUrl`, `latitude`, and `longitude`. Upload a logo first with `POST /api/v1/uploads` and save the returned `fileUrl`.
- `GET /grading-systems` (`grading-systems:read`) lists grading systems. `POST /grading-systems`, `PATCH /grading-systems/:id`, and `DELETE /grading-systems/:id` require `grading-systems:write`. Each system has a unique `name` and `grades` array with `grade`, `minScore`, `maxScore`, and optional `remark`; scores must be between 0 and 100.
- `GET /academic-calendars?page=1&limit=20&sessionId=<session-id>` (`academic-calendars:read`) lists calendar events. `POST /academic-calendars`, `PATCH /academic-calendars/:id`, and `DELETE /academic-calendars/:id` require `academic-calendars:write`. Events have a `title`, `startDate`, `endDate`, optional `description`, and optional `sessionId`; the start must precede the end.

Apply the included `add_institution_academic_settings` migration before starting the updated server. The default admin receives the new permissions during startup seeding; refresh the access token after the seed runs.

## Database migrations

Install dependencies and generate the Prisma client after cloning:

```powershell
npm ci
npx prisma generate
```

Create and apply a migration during development after changing `prisma/schema.prisma`:

```powershell
npx prisma migrate dev --name describe_the_change
npx prisma generate
```

Review the generated SQL and commit the new directory under `prisma/migrations/` together with the schema changes. Do not edit an already-applied migration. Create a new migration for a follow-up change.

To inspect migration status locally:

```powershell
npx prisma migrate status
```

For a deployment or any non-development environment, apply the committed migrations without creating or changing migrations:

```powershell
npx prisma migrate deploy
```

Do not use `prisma db push` in production. It bypasses the migration history and is intended for disposable or early development databases.

## Local development

```powershell
npm run dev
```

The server listens on `http://localhost:3000` by default. Startup ensures the default `admin`, `staff`, and `student` roles exist.

Check application and database availability with:

```powershell
Invoke-WebRequest http://localhost:3000/health
```

The endpoint returns `200` with `database: "up"` when healthy and `503` with `database: "down"` when the database cannot be reached.

## Production deployment

From a clean checkout:

```powershell
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

Set `NODE_ENV=production` and provide production values for every required environment variable. Run `npm start` from the `server` directory; it serves the compiled entrypoint at `dist/src/server.js`.

The process should be supervised by the hosting platform or a process manager. Keep `DATABASE_URL`, JWT secrets, and SMTP credentials in the platform's secret manager. Do not print them in logs or commit them to the repository.

## Troubleshooting

- `P1001` or database connection errors: check `DATABASE_URL`, database availability, firewall rules, and SSL requirements.
- `P3005` or migration history errors: inspect `npx prisma migrate status`; do not delete migration folders from a database that already has migration history.
- SMTP `535 BadCredentials`: verify the SMTP username, use a provider-specific app password, and confirm the SMTP port/security pairing.
- The process exits during startup: check the first error printed before the server begins listening. Database seeding runs during startup. For `ETIMEDOUT` errors when sending email, check whether the hosting network permits outbound SMTP on the configured port or use an email provider/API that is reachable from that environment.
