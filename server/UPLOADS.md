# File Upload API

The backend stores uploaded files in Cloudinary. The upload API accepts multipart form data and returns file metadata for the application to use.

## Configuration

Set these variables in `server/.env` or in the deployment environment:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Keep the Cloudinary API secret on the server. Do not put it in frontend code. Upload requests return `503 Service Unavailable` until all three values are configured.

## Upload requirements

- Send `multipart/form-data`.
- The single file field must be named `file`.
- Maximum file size: 20 MB.
- Accepted file types: JPEG, PNG, WEBP, GIF, and PDF.
- The server checks the file signature, not only the filename or browser-supplied MIME type.

## Public admission upload

Use this endpoint before submitting an admission application. It does not require an account and is rate-limited.

```http
POST /api/v1/uploads/admission
Content-Type: multipart/form-data
```

Example:

```bash
curl -X POST http://localhost:3000/api/v1/uploads/admission \
  -F "file=@passport.jpg"
```

Successful response:

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

Include the returned values in the corresponding admission document. Keep the `claimToken`; it proves that the file was uploaded through this API and expires after seven days.

```json
{
  "documents": [
    {
      "documentType": "PASSPORT",
      "fileName": "passport.jpg",
      "fileUrl": "https://res.cloudinary.com/example/image/upload/example-file.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 245000,
      "publicId": "school-management/admissions/pending/example-file",
      "resourceType": "image",
      "claimToken": "signed-upload-claim"
    }
  ]
}
```

Admission uploads are publicly deliverable while the application is pending. When the application is approved, the backend tags its managed uploads as admitted. When the application is rejected, the backend deletes its managed admission uploads.

## Authenticated private upload

Use this endpoint for files that are not public admission documents. It requires a bearer token for an administrator with the `uploads:write` permission.

```http
POST /api/v1/uploads
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

Example:

```bash
curl -X POST http://localhost:3000/api/v1/uploads \
  -H "Authorization: Bearer <access-token>" \
  -F "file=@internal-document.pdf"
```

Successful response:

```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "publicId": "school-management/private/example-file",
    "fileName": "internal-document.pdf",
    "fileUrl": "https://res.cloudinary.com/example/raw/authenticated/...",
    "mimeType": "application/pdf",
    "fileSize": 320000,
    "resourceType": "raw",
    "access": "authenticated"
  }
}
```

The private endpoint uses Cloudinary authenticated delivery. Its returned signed URL is for delivery, not permanent authorization; request a new signed URL when needed.

## Errors

Validation, upload limit, and unsupported-file errors use the standard API error response. For example:

```json
{
  "success": false,
  "message": "Unsupported file type; upload a JPEG, PNG, WEBP, GIF, or PDF"
}
```

Other possible responses include:

- `400 Bad Request` — missing file, file too large, or unsupported file content.
- `401 Unauthorized` / `403 Forbidden` — missing or insufficient credentials on the private endpoint.
- `429 Too Many Requests` — public admission upload rate limit reached.
- `502 Bad Gateway` — Cloudinary upload failed.
- `503 Service Unavailable` — Cloudinary credentials are not configured.
