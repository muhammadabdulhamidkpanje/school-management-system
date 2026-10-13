import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Request } from 'express';
import {
  authenticate,
  authorizePermission,
  authorizeRole,
} from '../src/middlewares/authenticate.js';
import {
  ForbiddenError,
  UnauthorizedError,
} from '../src/errors/index.js';
import { generateTokens } from '../src/utils/jwt.js';
import type { JwtPayload } from '../src/types/auth.types.js';

const createRequest = (authorization?: string) => ({
  headers: authorization ? { authorization } : {},
}) as unknown as Request;

const user: JwtPayload = {
  sub: 'user-1',
  email: 'admin@example.com',
  role: 'admin',
  permissions: ['users:read', 'users:write'],
};

const token = () => generateTokens(user).accessToken;

test('authenticate rejects a request without a bearer token', () => {
  let receivedError: unknown;

  authenticate(createRequest(), {}, error => {
    receivedError = error;
  });

  assert.ok(receivedError instanceof UnauthorizedError);
  assert.equal((receivedError as Error).message, 'No token provided');
});

test('authenticate rejects an invalid token', () => {
  let receivedError: unknown;

  authenticate(createRequest('Bearer invalid-token'), {}, error => {
    receivedError = error;
  });

  assert.ok(receivedError instanceof UnauthorizedError);
  assert.equal((receivedError as Error).message, 'Invalid or expired token');
});

test('authenticate attaches the verified user to the request', () => {
  const request = createRequest(`Bearer ${token()}`);
  let nextCalled = false;

  authenticate(request, {}, error => {
    assert.equal(error, undefined);
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(request.user?.sub, user.sub);
  assert.equal(request.user?.email, user.email);
  assert.equal(request.user?.role, user.role);
  assert.deepEqual(request.user?.permissions, user.permissions);
});

test('authorizeRole allows an allowed role and rejects another role', () => {
  const request = createRequest();
  request.user = user;
  let nextCalled = false;

  authorizeRole('admin')(request, {}, error => {
    assert.equal(error, undefined);
    nextCalled = true;
  });

  assert.equal(nextCalled, true);

  request.user = { ...user, role: 'student' };
  let receivedError: unknown;
  authorizeRole('admin')(request, {}, error => {
    receivedError = error;
  });

  assert.ok(receivedError instanceof ForbiddenError);
  assert.equal((receivedError as Error).message, 'Insufficient role');
});

test('authorizePermission requires every requested permission', () => {
  const request = createRequest();
  request.user = user;
  let nextCalled = false;

  authorizePermission('users:read', 'users:write')(request, {}, error => {
    assert.equal(error, undefined);
    nextCalled = true;
  });

  assert.equal(nextCalled, true);

  let receivedError: unknown;
  authorizePermission('users:delete')(request, {}, error => {
    receivedError = error;
  });

  assert.ok(receivedError instanceof ForbiddenError);
  assert.equal((receivedError as Error).message, 'Insufficient permissions');
});
