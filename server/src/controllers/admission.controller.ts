import type { Request, Response } from 'express';
import * as AdmissionService from '../services/admission.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

const admissionId = (req: Request) => req.params.id as string;
const requestId = (req: Request) => req.params.requestId as string;
const actorId = (req: Request) => req.user!.sub;
const applicantToken = (req: Request) => req.get('x-admission-token');

export const submit = asyncHandler(async (req: Request, res: Response) => {
  const { admission, applicantToken: token } = await AdmissionService.submitAdmission(req.body);
  sendCreated(res, {
    id: admission.id,
    applicationNumber: admission.applicationNumber,
    status: admission.status,
    academicSessionId: admission.sessionId,
    requestedClassId: admission.requestedClassId,
    createdAt: admission.createdAt.toISOString(),
    applicantToken: token,
  }, 'Admission submitted successfully');
});

export const publicSessions = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await AdmissionService.listPublicAdmissionSessions(), 'Open admission sessions fetched');
});

export const publicClassrooms = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await AdmissionService.listPublicAdmissionClassrooms(req.query.academicSessionId as string),
    'Available admission classes fetched',
  );
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  sendSuccess(res, await AdmissionService.listAdmissions(page, limit, status), 'Admissions fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  const admission = req.user
    ? await AdmissionService.getAdmissionForAdmin(admissionId(req))
    : await AdmissionService.getAdmissionForApplicant(admissionId(req), applicantToken(req));
  sendSuccess(res, admission, 'Admission fetched');
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await AdmissionService.getAdmissionForApplicant(admissionId(req), applicantToken(req)),
    'Admission status fetched',
  );
});

export const informationRequests = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await AdmissionService.getApplicantInformationRequests(admissionId(req), applicantToken(req)),
    'Admission information requests fetched',
  );
});

export const respondToInformationRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdmissionService.respondToInformationRequest(
    admissionId(req),
    requestId(req),
    applicantToken(req),
    req.body.response,
    req.body.document,
  );
  sendSuccess(res, result, 'Information response submitted');
});

export const review = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await AdmissionService.reviewAdmission(admissionId(req), actorId(req), req.ip),
    'Admission moved to review',
  );
});

export const requestInformation = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await AdmissionService.requestInformation(admissionId(req), actorId(req), req.body, req.ip),
    'Additional information requested',
  );
});

export const resolveInformationRequest = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await AdmissionService.resolveInformationRequest(
      admissionId(req),
      requestId(req),
      actorId(req),
      req.body.message,
      req.ip,
    ),
    'Information request resolved',
  );
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await AdmissionService.approveAdmission(admissionId(req), req.body.classId, actorId(req), req.ip),
    'Admission approved',
  );
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await AdmissionService.rejectAdmission(admissionId(req), req.body.reason, actorId(req), req.ip),
    'Admission rejected',
  );
});

export const enroll = asyncHandler(async (req: Request, res: Response) => {
  sendCreated(
    res,
    await AdmissionService.enrollAdmission(admissionId(req), actorId(req), req.ip),
    'Applicant enrolled successfully',
  );
});
