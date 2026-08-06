import { api } from "./api";
import { Funcionario, FuncionarioInput, OwnerInput, ClienteInput } from "@/types/auth";

interface LoginPayload {
    email: string;
    senha: string;
}

interface LoginResponse {
    accessToken: string;
}

interface MensagemResponse {
    message: string;
}

interface ClienteResponse {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    role: string;
}

export const authService = {
    login: (payload: LoginPayload) =>
        api.post<LoginResponse>('/auth/login', payload),

    register: (payload: ClienteInput) =>
        api.post<ClienteResponse>('/auth/register', payload),

    registerOwner: (payload: OwnerInput) =>
        api.post<MensagemResponse>('/auth/register-owner', payload),

    registerFuncionario: (payload: FuncionarioInput) =>
        api.post<Funcionario>('/auth/register-funcionario', payload),

    listarFuncionarios: () =>
        api.get<Funcionario[]>('/auth/funcionarios'),
};