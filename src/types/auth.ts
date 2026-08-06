export interface Usuario {
    id: string;
    email: string;
    role: 'cliente' | 'dono' | 'funcionario' | 'superadmin';
}

export interface AuthState {
    usuario: Usuario | null;
    isAuthenticated: boolean;
}

export interface OwnerInput {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    nomePizzaria: string;
    slug: string;
    endereco: string;
    logo_url: string;
}

export interface FuncionarioInput {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
}

export interface Funcionario {
    id: string;
    nome: string;
    email: string;
    telefone: string;
}

export interface ClienteInput {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
}