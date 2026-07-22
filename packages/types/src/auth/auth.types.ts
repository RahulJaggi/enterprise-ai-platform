export type Role = 'admin' | 'user' | 'system' | 'auditor';

export type Permission = 'read' | 'write' | 'delete' | 'execute' | 'admin' | 'ai:chat' | 'ai:admin';

export interface UserIdentity {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  tenantId: string;
  createdAt: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  tenantId: string;
  iat?: number;
  exp?: number;
}
