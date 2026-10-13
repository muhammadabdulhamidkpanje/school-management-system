export const getMissingAdmissionSubjects = (
  requiredSubjects: string[],
  submittedSubjects: string[],
) => {
  const submitted = new Set(submittedSubjects.map(subject => subject.trim().toLocaleLowerCase()));
  return requiredSubjects.filter(subject => !submitted.has(subject.trim().toLocaleLowerCase()));
};
