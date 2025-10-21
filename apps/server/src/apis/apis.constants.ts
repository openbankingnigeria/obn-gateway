export const apiSuccessMessages = {
  fetchedAPIs: 'Successfully fetched APIs',
  fetchedAPI: 'Successfully fetched API',
  updatedAPI: 'Successfully updated API',
  deletedAPI: 'Successfully deleted API',
  createdAPI: 'Successfully created API',
  importedAPISpec: 'Successfully imported API specification',
  assignAPIs: 'Successfully assigned APIs',
  updatedAPIAccess: 'Successfully updated company API access',
  unassignAPIs: 'Successfully unassigned APIs',
  fetchedAPILogs: 'Successfully fetched API logs',
  fetchedAPILog: 'Successfully fetched API log',
  fetchedAPILogsStats: 'Successfully fetched API logs stats',
  fetchedAPITransformation: 'Successfully fetched API transformation',
};

export const apiErrorMessages = {
  routeNotFound: (id: string) => `API '${id}' does not exist`,
  routeExists: (name: string) => `API name '${name}' exists`,
  collectionNotFound: (id: string) => `Collection '${id}' does not exist`,
  logNotFound: (id: string) => `API log '${id}' does not exist`,
  functionNotFound: (id: string) => `API '${id}' function does not exist`,
};
