# School Management System MVP TODO

## P0 - Release Blockers

- [x] Fix TypeScript `rootDir` configuration for root interfaces and Prisma config.
- [x] Fix the `email.controller.ts` route parameter type error.
- [x] Add cookie parsing and configure refresh-token cookies.
- [x] Configure CORS for the frontend.
- [x] Validate required environment variables and remove default JWT secrets.
- [x] Add database migration and deployment documentation.
- [x] Standardize global API error responses.
- [x] Add a health-check endpoint with database status.
- [x] Add automated tests for authentication and authorization.

## P1 - Authentication and Users

- [x] Complete password-reset email flow and remove reset tokens from API responses.
- [x] Prevent reuse of expired or already-used reset tokens.
- [x] Return the database-backed profile from `/auth/me`.
- [x] Add user profile update endpoint.
- [x] Add admin user CRUD.
- [x] Add user activation and deactivation.
- [x] Add role CRUD.
- [x] Add permission CRUD and role-permission assignment.
- [x] Apply role and permission authorization to protected routes.
- [x] Enforce verified email where required.
- [x] Add login and password-reset rate limiting.
- [x] Add account lockout or suspicious-login protection.

## P1 - Academic Management

- [x] Add department CRUD.
- [x] Add faculty CRUD.
- [x] Add classroom CRUD.
- [x] Add course CRUD.
- [x] Add subject CRUD.
- [x] Add academic-session CRUD.
- [x] Add semester CRUD.
- [x] Assign courses and subjects to departments and faculty.
- [x] Assign lecturers or staff to courses.
- [x] Add pagination, filtering, search, and duplicate validation.

## P1 - Students and Staff

- [x] Add student records and admission workflow.
- [x] Add student academic profiles.
- [x] Add staff records and employment details.
- [x] Add student enrollment in courses or classes.
- [x] Add student and staff search and pagination.
- [x] Add CSV import/export.

## P1 - Attendance

- [x] Create attendance sessions.
- [x] Mark and edit student attendance.
- [x] Prevent duplicate attendance records.
- [x] Add student attendance history.
- [x] Add class and course attendance summaries.
- [x] Calculate attendance percentages.
- [x] Add attendance reports and filtering.

## P1 - Results and Grades

- [x] Add assessment and exam setup.
- [x] Record student scores.
- [x] Calculate grades.
- [x] Add result publication workflow.
- [x] Add student result history and report cards.
- [x] Lock published results from unauthorized edits.
- [x] Audit result changes.

## P1 - Notifications

- [ ] Add notification pagination.
- [ ] Add admin notification creation.
- [ ] Complete account-activation notification flow.
- [ ] Handle and monitor failed email delivery.
- [ ] Add notification preferences.
- [ ] Add SMS support if required for MVP.

## P2 - Dashboard and Reporting

- [ ] Add admin dashboard statistics.
- [ ] Add enrollment, attendance, results, staff, and student summaries.
- [ ] Add dashboard charts.
- [ ] Add CSV or PDF report export.
- [ ] Add date-range filtering.

## P2 - Security and Operations

- [ ] Complete audit logging for all sensitive changes.
- [ ] Add administrator audit-log queries.
- [ ] Add Helmet security headers.
- [ ] Add general API rate limiting.
- [ ] Add request IDs and production-safe logging.
- [ ] Hash or securely store refresh tokens.
- [ ] Add database indexes for common searches.
- [ ] Document local setup, testing, deployment, and environment variables.

## SaaS Productization

### P0 - Tenant Isolation (Release Blocker)

- [ ] Choose and document the tenant isolation model (shared database with tenant IDs or separate database per school).
- [ ] Add school/tenant records, lifecycle status, and tenant-scoped membership for users.
- [ ] Associate every school-owned record with a tenant, including academic, student, staff, admission, attendance, result, finance, and file data.
- [ ] Scope every read, write, update, delete, search, export, and background task to the authenticated tenant; never trust a tenant ID supplied by the client without membership authorization.
- [ ] Make unique constraints and indexes tenant-aware where records are unique only within a school.
- [ ] Ensure roles, permissions, audit logs, uploads, and generated reports are tenant-scoped.
- [ ] Plan and test migration of existing single-school data into an initial tenant without data loss.
- [ ] Add automated cross-tenant isolation tests for every tenant-owned resource and privileged workflow.

### P1 - School Onboarding and Administration

- [ ] Implement school signup/provisioning and a first-run setup flow for school profile, academic year, and initial administrator.
- [ ] Add tenant-scoped invitations, membership management, and staff role assignment.
- [ ] Add tenant lifecycle controls for activation, suspension, reactivation, and closure, including defined access behavior for each state.
- [ ] Build a separate platform-operator role and protected control-plane endpoints for managing customer tenants.
- [ ] Define tenant data export, retention, and deletion workflows, including uploaded files and audit records.

### P1 - SaaS Plans and Billing

- [ ] Select a SaaS subscription payment provider and document supported currencies, regions, and webhook requirements.
- [ ] Define plans, trial rules, subscription states, billing intervals, and tenant entitlements/usage limits.
- [ ] Keep SaaS subscription billing separate from the school's student-fee and finance workflows.
- [ ] Implement subscription checkout, plan changes, cancellation, renewal, and billing-history endpoints.
- [ ] Verify provider webhook signatures and process events idempotently; cover retries, out-of-order events, and duplicate delivery.
- [ ] Enforce subscription status and entitlements on tenant access and plan-limited features, with clear grace-period behavior.
- [ ] Add billing tests for successful payment, failure, renewal, cancellation, webhook replay, and subscription state changes.

### P1 - SaaS Readiness and Operations

- [ ] Add tenant-aware support diagnostics and audit events without exposing one tenant's data to another.
- [ ] Define per-tenant backup, restore, and recovery procedures and test restoring a tenant's data.
- [ ] Add service monitoring and alerts for database availability, background work, billing webhooks, and email delivery.
- [ ] Review privacy, data-protection, and security requirements for the target markets; document retention, incident response, and customer data access procedures.
- [ ] Add end-to-end tests for signup through onboarding, invitation, plan enforcement, billing lifecycle, suspension, export, and closure.
- [ ] Document tenant architecture, customer onboarding, plans and entitlements, billing operations, support access, and data lifecycle.

## Optional Modules

- [x] Finance and fees.
- [ ] Library management.
- [ ] Parent accounts.
- [ ] Transport management.
- [ ] Hostel management.
- [ ] File and document management.
