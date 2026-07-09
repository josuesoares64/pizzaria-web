import { api } from "./api";

interface LoginPayload {
    email: string;
    senha: string;
}

interface LoginResponse {
    accessToken: string;
}

export const authService = {
    login: (payload: LoginPayload) => 
        api.post<LoginResponse>('/auth/login', payload),
};