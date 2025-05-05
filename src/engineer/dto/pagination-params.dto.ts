import { AvailabilityStatus } from "src/common/enum/AvailabilityStatus.enum";

export interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
    specialty?: string;
    availability?: AvailabilityStatus;
  }
  
 export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }