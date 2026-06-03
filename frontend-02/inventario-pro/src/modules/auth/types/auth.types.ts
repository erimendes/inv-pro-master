export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;

  login: (data: LoginDTO) => Promise<void>;

  register: (data: RegisterDTO) => Promise<void>;

  logout: () => void;
}