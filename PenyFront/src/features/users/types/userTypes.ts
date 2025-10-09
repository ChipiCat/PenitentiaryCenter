export interface UserStat {
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastAccess: string;
  createdAt: string;
  avatar?: string;
}

export interface UserActions {
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}