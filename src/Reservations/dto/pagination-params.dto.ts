export interface PaginationParams {
    page: number;
    limit: number;
    search?: string; 
    status?: string; 
    commercialId?: number; 
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }