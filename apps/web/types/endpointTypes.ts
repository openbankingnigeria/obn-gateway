export interface GetListProps {
  page: string; 
  limit: string; 
  name?: string; 
  event?: string; 
  status?: string;
  role?: string;
  email?: string;
  createdAt_gt?: string; 
  createdAt_l?: string; 
}

export interface GetSingleProps {
  id: string;
}

export interface GetEnvironmentProps {
  page: string;
  limit: string;
  environment: string;
  id?: string;
  companyId?: string;
  collectionId?: string;
}

export interface GetSingleEnvironmentProps {
  environment: string;
  id?: string;
}

export interface PostTokenProps {
  token: string;
}