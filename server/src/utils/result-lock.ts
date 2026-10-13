import { ForbiddenError } from '../errors/errors.js';

export const assertResultEditable = (published: boolean) => {
  if (published) throw new ForbiddenError('Published result is locked');
};