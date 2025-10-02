// API endpoint constants for table
export const TABLE_API = {
  LIST: '/table/list',
  ADD: '/table/add',
  UPDATE: '/table/update',
  DELETE: '/table/delete',
};

// Request/Response interfaces
export interface Table {
  id: string;
  number: string;
  seats: number;
  status: string;
  // Add other fields as needed
}

export interface TableListResponse {
  tables: Table[];
}

export interface TableAddRequest {
  number: string;
  seats: number;
  status?: string;
}

export interface TableUpdateRequest {
  id: string;
  number?: string;
  seats?: number;
  status?: string;
}

export interface TableDeleteResponse {
  success: boolean;
}
