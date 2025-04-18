interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
    specialty?: string;
  }
  
  interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }