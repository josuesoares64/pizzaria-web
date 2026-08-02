import { api } from "./api";
import { Funcionario, FuncionarioInput, OwnerInput } from "@/types/auth";

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

export const authService = {
    login: (payload: LoginPayload) =>
        api.post<LoginResponse>('/auth/login', payload),

    registerOwner: (payload: OwnerInput) =>
        api.post<MensagemResponse>('/auth/register-owner', payload),

    registerFuncionario: (payload: FuncionarioInput) =>
        api.post<Funcionario>('/auth/register-funcionario', payload),

    listarFuncionarios: () =>
        api.get<Funcionario[]>('/auth/funcionarios'),
};