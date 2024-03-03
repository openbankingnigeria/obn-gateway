export const collectionsSuccessMessages = {
  fetchedCollections: 'Successfully fetched collections',
  fetchedCollection: 'Successfully fetched collection',
  updatedCollection: 'Successfully updated collection',
  deletedCollection: 'Successfully deleted collection',
  createdCollection: 'Successfully created collection',
};

export const collectionErrorMessages = {
  collectionNotFound: (id: string) => `Collection '${id}' does not exist`,
  collectionExists: (name: string) => `Collection name '${name}' exists`,
  collectionNotEmpty: 'Cannot delete collection with APIs',
};
