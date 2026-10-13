//asyn handler for async functions
export const handleAsync = (fn: Function) => {
  return async (req: any, res: any, next: any) => { 

    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);    
    }
    }
}
