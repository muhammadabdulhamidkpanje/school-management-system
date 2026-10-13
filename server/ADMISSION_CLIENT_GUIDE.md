# Public Admission Client Integration

This guide describes how an unauthenticated applicant client loads valid session
and class IDs, uploads required documents, and submits an admission application.

Set the API base URL for the environment, for example:

```text
http://localhost:3000
```

All endpoints below are relative to that base URL. The public admission
endpoints do not require an admin access token.

## 1. Load open academic sessions

```http
GET /api/v1/admissions/options/sessions
```

Example response:

```json
{
  "success": true,
  "message": "Open admission sessions fetched",
  "data": [
    {
      "id": "cm8nc5s8n0000m8f7u0s3t4p5",
      "name": "2026/2027",
      "startDate": "2026-09-01T00:00:00.000Z",
      "endDate": "2027-07-31T00:00:00.000Z",
      "isCurrent": true,
      "requiredAdmissionSubjects": ["English", "Mathematics"]
    }
  ]
}
```

Populate the session selector with `name`, but submit its `id` as
`academicSessionId`. The endpoint returns only sessions with admissions open.

### Set defaults for the session and class fields

The client can initially select the current open session (or the first open
session when none is marked current), then select the first class available for
that session. Keep both controls editable so the applicant can choose another
option. For example, in React:

```jsx
const API_BASE_URL = "http://localhost:3000";

async function loadAdmissionDefaults() {
  const sessionsResponse = await fetch(
    `${API_BASE_URL}/api/v1/admissions/options/sessions`
  );
  if (!sessionsResponse.ok) {
    throw new Error("Could not load open admission sessions.");
  }

  const { data: sessions } = await sessionsResponse.json();
  const defaultSession =
    sessions.find((session) => session.isCurrent) ?? sessions[0];

  if (!defaultSession) {
    return {
      sessions,
      classes: [],
      academicSessionId: "",
      classId: "",
    };
  }

  const classesResponse = await fetch(
    `${API_BASE_URL}/api/v1/admissions/options/classes?academicSessionId=${encodeURIComponent(defaultSession.id)}`
  );
  if (!classesResponse.ok) {
    throw new Error("Could not load classes for the selected session.");
  }

  const { data: classes } = await classesResponse.json();
  return {
    sessions,
    classes,
    academicSessionId: defaultSession.id,
    classId: classes[0]?.id ?? "",
  };
}

function AdmissionForm() {
  const [sessions, setSessions] = React.useState([]);
  const [classes, setClasses] = React.useState([]);
  const [form, setForm] = React.useState({
    academicSessionId: "",
    classId: "",
  });
  const [optionsError, setOptionsError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    loadAdmissionDefaults()
      .then((defaults) => {
        if (!cancelled) {
          setSessions(defaults.sessions);
          setClasses(defaults.classes);
          setForm((current) => ({
            ...current,
            academicSessionId: defaults.academicSessionId,
            classId: defaults.classId,
          }));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setOptionsError(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSessionChange(academicSessionId) {
    setForm((current) => ({ ...current, academicSessionId, classId: "" }));
    setClasses([]);
    setOptionsError("");

    if (!academicSessionId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admissions/options/classes?academicSessionId=${encodeURIComponent(academicSessionId)}`
      );
      if (!response.ok) {
        throw new Error("Could not load classes for the selected session.");
      }
      const { data } = await response.json();
      setClasses(data);
      setForm((current) => ({
        ...current,
        classId: data[0]?.id ?? "",
      }));
    } catch (error) {
      setOptionsError(error.message);
    }
  }

  return (
    <>
      {optionsError && <p role="alert">{optionsError}</p>}
      <select
        value={form.academicSessionId}
        onChange={(event) => handleSessionChange(event.target.value)}
      >
        <option value="">Select a session</option>
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {session.name}
          </option>
        ))}
      </select>
      <select
        value={form.classId}
        onChange={(event) =>
          setForm((current) => ({ ...current, classId: event.target.value }))
        }
        disabled={!classes.length}
      >
        <option value="">Select a class</option>
        {classes.map((classroom) => (
          <option key={classroom.id} value={classroom.id}>
            {classroom.name}
          </option>
        ))}
      </select>
    </>
  );
}
```

The session and class defaults are IDs from the API responses, not labels or
hard-coded values. If there is no open session or no available class, the
corresponding field remains empty and should not be submitted until a valid
choice is available.

## 2. Load classes for the selected session

After the applicant selects a session, request that session's available classes:

```http
GET /api/v1/admissions/options/classes?academicSessionId=cm8nc5s8n0000m8f7u0s3t4p5
```

`academicSessionId` must be the actual session `id` from step 1, in CUID format.

Example response:

```json
{
  "success": true,
  "message": "Available admission classes fetched",
  "data": [
    {
      "id": "cm8nc5s8n0000m8f7u0s3t4p6",
      "name": "JSS 1",
      "level": "Junior Secondary"
    }
  ]
}
```

Populate the class selector with the returned class name and submit its `id` as
`classId`. The endpoint includes only active classes linked to the selected
session. If the session is missing, invalid, or no longer open, the API returns
an error.

## 3. Upload each required document

Upload documents individually before submitting the application:

```http
POST /api/v1/uploads/admission
Content-Type: multipart/form-data
```

The multipart file field must be named `file`. Allowed file types are JPEG,
PNG, WEBP, GIF, and PDF; the maximum size is 20 MB.

Example response:

```json
{
  "success": true,
  "message": "Admission file uploaded",
  "data": {
    "publicId": "school-management/admissions/pending/example-file",
    "fileName": "passport.jpg",
    "fileUrl": "https://res.cloudinary.com/example/image/upload/example-file.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 245000,
    "resourceType": "image",
    "access": "public",
    "claimToken": "signed-upload-claim"
  }
}
```

Keep the returned `claimToken` and pass the returned `fileName`, `fileUrl`,
`mimeType`, `fileSize`, `publicId`, `resourceType`, and `claimToken` unchanged
in that document's admission payload. Upload claims expire after seven days.
See [UPLOADS.md](./UPLOADS.md) for more details.

The application must include exactly one document of each required type:

- `PASSPORT`
- `BIRTH_CERTIFICATE`
- `SCHOOL_RESULT`
- `MEDICAL_REPORT`

Other document types may also be included, but document types cannot be
duplicated. All document URLs must use HTTPS.

## 4. Submit the application

```http
POST /api/v1/admissions
Content-Type: application/json
```

Example request:

```json
{
  "firstName": "Ada",
  "middleName": "Ehi",
  "lastName": "Okafor",
  "email": "ada@example.com",
  "dateOfBirth": "2008-06-14",
  "gender": "Female",
  "nationality": "Nigerian",
  "stateOfOrigin": "Lagos",
  "lga": "Ikeja",
  "religion": "Christianity",
  "academicSessionId": "cm8nc5s8n0000m8f7u0s3t4p5",
  "classId": "cm8nc5s8n0000m8f7u0s3t4p6",
  "results": [
    { "subject": "English", "grade": "A1" },
    { "subject": "Mathematics", "grade": "B2" }
  ],
  "documents": [
    {
      "documentType": "PASSPORT",
      "fileName": "passport.jpg",
      "fileUrl": "https://res.cloudinary.com/example/image/upload/passport.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 245000,
      "publicId": "school-management/admissions/pending/passport",
      "resourceType": "image",
      "claimToken": "signed-upload-claim"
    },
    {
      "documentType": "BIRTH_CERTIFICATE",
      "fileName": "birth-certificate.pdf",
      "fileUrl": "https://res.cloudinary.com/example/raw/upload/birth-certificate.pdf",
      "mimeType": "application/pdf",
      "fileSize": 320000,
      "publicId": "school-management/admissions/pending/birth-certificate",
      "resourceType": "raw",
      "claimToken": "signed-upload-claim"
    },
    {
      "documentType": "SCHOOL_RESULT",
      "fileName": "school-result.pdf",
      "fileUrl": "https://res.cloudinary.com/example/raw/upload/school-result.pdf",
      "mimeType": "application/pdf",
      "fileSize": 510000,
      "publicId": "school-management/admissions/pending/school-result",
      "resourceType": "raw",
      "claimToken": "signed-upload-claim"
    },
    {
      "documentType": "MEDICAL_REPORT",
      "fileName": "medical-report.pdf",
      "fileUrl": "https://res.cloudinary.com/example/raw/upload/medical-report.pdf",
      "mimeType": "application/pdf",
      "fileSize": 430000,
      "publicId": "school-management/admissions/pending/medical-report",
      "resourceType": "raw",
      "claimToken": "signed-upload-claim"
    }
  ]
}
```

The document values above are illustrative. Use the actual values returned by
the upload endpoint. Do not send extra properties such as `status`.

### Validation rules

- Required applicant fields: `firstName`, `lastName`, `email`, `dateOfBirth`,
  `gender`, `nationality`, `stateOfOrigin`, and `lga`.
- `middleName` and `religion` are optional.
- `dateOfBirth` must be a real date in `YYYY-MM-DD` format.
- `academicSessionId` and `classId` must be CUID IDs from steps 1 and 2.
- `results` must contain 1–20 entries. Each entry has a non-empty `subject` and
  `grade`; subjects must be unique ignoring case. Include all subjects listed
  in the selected session's `requiredAdmissionSubjects`.
- `documents` must contain 1–20 entries and all four required document types.
  Document types must be uppercase letters, digits, and underscores, with no
  duplicates. Each `fileSize` must be a positive integer no greater than 20 MB.
- The selected session must still be open, and the class must still be active
  and available for that session at submission time.

### Successful response

The API responds with HTTP `201 Created`:

```json
{
  "success": true,
  "message": "Admission submitted successfully",
  "data": {
    "id": "cm8nc5s8n0000m8f7u0s3t4p7",
    "applicationNumber": "ADM-2026-0123456789ABCDEF",
    "status": "PENDING",
    "academicSessionId": "cm8nc5s8n0000m8f7u0s3t4p5",
    "requestedClassId": "cm8nc5s8n0000m8f7u0s3t4p6",
    "createdAt": "2026-10-07T11:00:00.000Z",
    "applicantToken": "keep-this-private"
  }
}
```

Store `applicationNumber` for display and keep `applicantToken` private; the
applicant needs it for later access to the application.

### Handling errors

Validation failures return HTTP `400` with field-level details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "academicSessionId": "Invalid cuid",
    "classId": "Invalid cuid"
  }
}
```

Display the `errors` messages next to their corresponding form fields. Refresh
the session/class options if IDs are invalid or the selected session has closed.

## Client flow summary

1. Call `GET /api/v1/admissions/options/sessions`.
2. The client preselects the current open session (or first open session); let
   the applicant change it if needed and retain its `id`.
3. Call `GET /api/v1/admissions/options/classes?academicSessionId=<session-id>`.
4. The client preselects the first available class; let the applicant change it
   if needed and retain its `id`.
5. Upload each required document to `POST /api/v1/uploads/admission`; retain
   each response including its `claimToken`.
6. Build the JSON request with the selected IDs, applicant details, required
   results, and uploaded document metadata.
7. Submit it to `POST /api/v1/admissions`.
8. On success, save/display the application number and securely retain the
   applicant token. On failure, show the returned field errors.
