import prisma from '../config/prisma.js';

export const getInstitutionProfile = () =>
  prisma.institutionProfile.findUnique({ where: { id: 'default' } });

export const updateInstitutionProfile = async (
  dto: {
    name: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
    logoUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  },
  actorId: string,
  ipAddress?: string,
) => {
  const profile = await prisma.institutionProfile.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...dto },
    update: dto,
  });
  await prisma.auditLog.create({
    data: {
      action: 'INSTITUTION_PROFILE_UPDATED',
      userId: actorId,
      recordId: profile.id,
      ...(ipAddress !== undefined && { ipAddress }),
    },
  });
  return profile;
};
