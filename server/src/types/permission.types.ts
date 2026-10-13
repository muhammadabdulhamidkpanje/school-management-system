export interface CreatePermissionDTO {
  name: string;
  description?: string;
}

export interface UpdatePermissionDTO {
  name?: string;
  description?: string | null;
}
