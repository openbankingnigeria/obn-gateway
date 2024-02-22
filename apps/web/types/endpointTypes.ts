export interface GetListProps {
  page: string; 
  limit: string; 
  name?: string; 
  event?: string; 
  status?: string;
  kybStatus?: string;
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
  referenceId?: any;
  environment: string;
  id?: string;
  companyId?: string;
  collectionId?: string;
  apiId?: string;
  name?: string;
  method?: string;
  createdAt_gt?: string;
  createdAt_l?: string;
  status?: any;
}

export interface GetSingleEnvironmentProps {
  environment: string;
  id?: string;
  name?: string;
  method?: string;
  collectionId?: string;
}

export interface PostTokenProps {
  token: string;
}

export interface GetTypeProps {
  type: string;
}

export interface DateFilterProps {
  createdAt_gt?: string; 
  createdAt_l?: string; 
}