export interface GetListProps {
  page: string; 
  limit: string; 
  name?: string; 
  event?: string; 
  status?: string;
  email?: string;
  createdAt_gt?: string; 
  createdAt_l?: string; 
}

export interface GetSingleProps {
  id: string;
}

export interface PostTokenProps {
  token: string;
}