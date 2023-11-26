export const collectionsSuccessMessages = {
  fetchedCollections: 'Successfully fetched collections',
  fetchedCollection: 'Successfully fetched collection',
  updatedCollection: 'Successfully updated collection',
  deletedCollection: 'Successfully deleted collection',
  createdCollection: 'Successfully created collection',

  fetchedAPIs: 'Successfully fetched APIs',
  fetchedAPI: 'Successfully fetched API',
  updatedAPI: 'Successfully updated API',
  deletedAPI: 'Successfully deleted API',
  createdAPI: 'Successfully created API',
};

export const collectionErrorMessages = {
  collectionNotFound: (id: string) => `Collection '${id}' does not exist`,
};
