import { AlterarSenhaForm } from "@/components/AlterarSenhaForm";

export default function MinhaContaPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-neutral-900">Minha conta</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Altere a senha que você usa para entrar no sistema.
      </p>
      <div className="mt-6">
        <AlterarSenhaForm />
      </div>
    </div>
  );
}