"use client";

import { useEffect, useRef, useState } from "react";
import { pizzariaService } from "@/server/pizzaria.service";
import { PizzariaMe } from "@/types/pizzaria";

export default function ConfiguracoesPage() {
    const [pizzaria, setPizzaria] = useState<PizzariaMe | null>(null);
    const [form, setForm] = useState({ nome: "", slug: "", telefone: "" });
    const [endereco, setEndereco] = useState({
        cep: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
    });
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [enviandoLogo, setEnviandoLogo] = useState(false);
    const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
    // cache-buster: o path da logo no bucket é sempre o mesmo ({pizzariaId}/logo.webp),
    // então sem isso o browser mostra a versão antiga em cache mesmo após o upload.
    // Guardado no localStorage (não no state) pra sobreviver a um F5 — um state comum
    // reseta pra 0 no reload, e nesse momento o browser já tem a URL sem "?t=" em cache.
    const [logoCacheBuster, setLogoCacheBuster] = useState<number | null>(null);
    const inputLogoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function carregar() {
            try {
                const dados = await pizzariaService.getMe();
                setPizzaria(dados);
                setForm({
                    nome: dados.nome,
                    slug: dados.slug,
                    telefone: dados.telefone || "",
                });
            } catch (err) {
                setMensagem({ tipo: "erro", texto: "Erro ao carregar dados da pizzaria" });
            } finally {
                setLoading(false);
            }
        }
        carregar();

        // recupera o último cache-buster salvo, se existir, pra já aplicar
        // desde o primeiro render (evita mostrar a logo antiga em cache até o próximo upload)
        const salvo = window.localStorage.getItem("bella-pizza:logo-cache-buster");
        if (salvo) setLogoCacheBuster(Number(salvo));
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleEnderecoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setEndereco((prev) => ({ ...prev, [name]: value }));
    }

    function montarEnderecoString() {
        const { rua, numero, bairro, cidade, estado, cep } = endereco;
        const partes = [
            rua && numero ? `${rua}, ${numero}` : rua,
            bairro,
            cidade && estado ? `${cidade} - ${estado}` : cidade || estado,
            cep,
        ].filter(Boolean);
        return partes.join(", ");
    }

    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault();
        if (!pizzaria) return;

        if (form.slug !== pizzaria.slug) {
            const confirmar = window.confirm(
                "Você está alterando o slug da pizzaria. Isso muda o link do cardápio público e pode quebrar links já compartilhados com clientes. Deseja continuar?"
            );
            if (!confirmar) return;
        }

        const enderecoFinal = montarEnderecoString();

        setSalvando(true);
        setMensagem(null);
        try {
            const atualizado = await pizzariaService.atualizar({
                nome: form.nome,
                slug: form.slug,
                telefone: form.telefone,
                ...(enderecoFinal ? { endereco: enderecoFinal } : {}),
            });
            setPizzaria(atualizado);
            setForm({
                nome: atualizado.nome,
                slug: atualizado.slug,
                telefone: atualizado.telefone || "",
            });
            setEndereco({ cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "" });
            setMensagem({ tipo: "sucesso", texto: "Configurações salvas com sucesso!" });
        } catch (err) {
            const mensagemErro = err instanceof Error ? err.message : "Erro ao salvar configurações";
            setMensagem({ tipo: "erro", texto: mensagemErro });
        } finally {
            setSalvando(false);
        }
    }

    async function handleSelecionarLogo(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        // limpa o input pra permitir selecionar o mesmo arquivo de novo depois, se precisar
        e.target.value = "";
        if (!file) return;

        setEnviandoLogo(true);
        setMensagem(null);
        try {
            const atualizado = await pizzariaService.uploadLogo(file);
            setPizzaria(atualizado);
            const agora = Date.now();
            setLogoCacheBuster(agora);
            window.localStorage.setItem("bella-pizza:logo-cache-buster", String(agora));
            setMensagem({ tipo: "sucesso", texto: "Logo atualizada com sucesso!" });
        } catch (err) {
            const mensagemErro = err instanceof Error ? err.message : "Erro ao enviar logo";
            setMensagem({ tipo: "erro", texto: mensagemErro });
        } finally {
            setEnviandoLogo(false);
        }
    }

    if (loading) {
        return <div className="p-6 text-gray-500">Carregando configurações...</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Configurações</h1>

            {mensagem && (
                <div
                    className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                        mensagem.tipo === "sucesso"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    {mensagem.texto}
                </div>
            )}

            {/* Logo da pizzaria */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-3">Logo da pizzaria</label>
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {pizzaria?.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={`${pizzaria.logo_url}${logoCacheBuster ? `?t=${logoCacheBuster}` : ""}`}
                                alt="Logo da pizzaria"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs text-gray-400 text-center px-1">Sem logo</span>
                        )}
                    </div>
                    <div>
                        <input
                            ref={inputLogoRef}
                            type="file"
                            accept="image/*"
                            onChange={handleSelecionarLogo}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => inputLogoRef.current?.click()}
                            disabled={enviandoLogo}
                            className="text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg px-3 py-1.5"
                        >
                            {enviandoLogo ? "Enviando..." : "Alterar logo"}
                        </button>
                        <p className="text-xs text-gray-500 mt-1.5">PNG ou JPG, até 8MB.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSalvar} className="space-y-5 bg-white border border-gray-200 rounded-xl p-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da pizzaria</label>
                    <input
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (link do cardápio)</label>
                    <input
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Cardápio público: <span className="font-mono">/{form.slug}</span>
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div className="border-t border-gray-100 pt-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço atual</label>
                    <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3">
                        {pizzaria?.endereco || "Nenhum endereço cadastrado"}
                    </p>

                    <p className="text-xs text-gray-500 mb-2">
                        Preencha os campos abaixo para atualizar o endereço (isso substitui o endereço atual):
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            name="cep"
                            placeholder="CEP"
                            value={endereco.cep}
                            onChange={handleEnderecoChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            name="numero"
                            placeholder="Número"
                            value={endereco.numero}
                            onChange={handleEnderecoChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            name="rua"
                            placeholder="Rua"
                            value={endereco.rua}
                            onChange={handleEnderecoChange}
                            className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            name="bairro"
                            placeholder="Bairro"
                            value={endereco.bairro}
                            onChange={handleEnderecoChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            name="cidade"
                            placeholder="Cidade"
                            value={endereco.cidade}
                            onChange={handleEnderecoChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            name="estado"
                            placeholder="Estado (UF)"
                            value={endereco.estado}
                            onChange={handleEnderecoChange}
                            maxLength={2}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plano atual</label>
                    <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 capitalize">
                        {pizzaria?.plano}
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={salvando}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2.5 rounded-lg transition"
                >
                    {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
            </form>
        </div>
    );
}