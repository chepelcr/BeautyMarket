export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
