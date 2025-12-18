export interface CreateUserResponse {
  error: boolean;
  data: UserAttributes;
}

export interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
