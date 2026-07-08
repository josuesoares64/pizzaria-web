export interface Usuario {
    id: string;
    nome: string;
    email: string;
    role: 'cliente' | 'dono' | 'funcionario' | 'superadmin';
}

export interface AuthState {
    usuario: Usuario | null;
    isAuthenticated: boolean;
}