export const apiSuccessMessages = {
  fetchedAPIs: 'Successfully fetched APIs',
  fetchedAPI: 'Successfully fetched API',
  updatedAPI: 'Successfully updated API',
  deletedAPI: 'Successfully deleted API',
  createdAPI: 'Successfully created API',
  fetchedAPILogs: 'Successfully fetched API logs',
};

export const apiErrorMessages = {
  routeNotFound: (id: string) => `API Route '${id}' does not exist`,
  routeExists: (name: string) => `API Route name '${name}' exists`,
  collectionNotFound: (id: string) => `Collection '${id}' does not exist`,
  logNotFound: (id: string) => `API log '${id}' does not exist`,
};
