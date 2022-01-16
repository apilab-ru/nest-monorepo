export interface AuthParams {
  email: string;
  password: string;
}

export interface UserResponse {
  email: string;
  id: number;
  token: string;
}
