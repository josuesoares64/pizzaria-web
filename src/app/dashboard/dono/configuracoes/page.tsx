"use client";

import { useEffect, useRef, useState } from "react";
import { pizzariaService } from "@/server/pizzaria.service";
import { localidadeTaxaService, LocalidadeTaxa } from "@/server/localidadeTaxa.service";
import { PizzariaMe } from "@/types/pizzaria";
import { FiTrash2, FiPlus, FiEdit2, FiCheck, FiX } from "react-icons/fi";

export default function ConfiguracoesPage() {
  const [pizzaria, setPizzaria] = useState<PizzariaMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);
  const [logoCacheBuster, setLogoCacheBuster] = useState<number | null>(null);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const inputLogoRef = useRef<HTMLInputElement>(null);

  // ---- Card: Identidade ----
  const [formIdentidade, setFormIdentidade] = useState({ nome: "", slug: "" });
  const [salvandoIdentidade, setSalvandoIdentidade] = useState(false);

  // ---- Card: Entrega e contato ----
  const [formEntrega, setFormEntrega] = useState({ telefone: "", taxaEntrega: "" });
  const [endereco, setEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [salvandoEntrega, setSalvandoEntrega] = useState(false);

  // ---- Card: Bairros e taxas de entrega ----
  const [localidades, setLocalidades] = useState<LocalidadeTaxa[]>([]);
  const [carregandoLocalidades, setCarregandoLocalidades] = useState(true);
  const [novoBairro, setNovoBairro] = useState("");
  const [novaTaxa, setNovaTaxa] = useState("");
  const [salvandoLocalidade, setSalvandoLocalidade] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editBairro, setEditBairro] = useState("");
  const [editTaxa, setEditTaxa] = useState("");
  const [salvandoEdicaoId, setSalvandoEdicaoId] = useState<string | null>(null);
  const [alternandoAtivoId, setAlternandoAtivoId] = useState<string | null>(null);

  // ---- Card: Impressão ----
  const [larguraCupom, setLarguraCupom] = useState<"58mm" | "80mm">("80mm");
  const [salvandoImpressao, setSalvandoImpressao] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await pizzariaService.getMe();
        setPizzaria(dados);
        setFormIdentidade({ nome: dados.nome, slug: dados.slug });
        setFormEntrega({
          telefone: dados.telefone || "",
          taxaEntrega:
            dados.taxa_entrega !== null && dados.taxa_entrega !== undefined
              ? String(dados.taxa_entrega)
              : "",
        });
        setLarguraCupom(dados.largura_cupom);
      } catch (err) {
        console.error(err);
        setMensagem({ tipo: "erro", texto: "Erro ao carregar dados da pizzaria" });
      } finally {
        setLoading(false);
      }
    }
    carregar();

    const salvo = window.localStorage.getItem("forno-menu:logo-cache-buster");
    if (salvo) setLogoCacheBuster(Number(salvo));
  }, []);

  useEffect(() => {
    async function carregarLocalidades() {
      try {
        const dados = await localidadeTaxaService.listar();
        setLocalidades(dados);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregandoLocalidades(false);
      }
    }
    carregarLocalidades();
  }, []);

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

  // ---- Salvar: Identidade ----
  async function handleSalvarIdentidade(e: React.FormEvent) {
    e.preventDefault();
    if (!pizzaria) return;

    if (formIdentidade.slug !== pizzaria.slug) {
      const confirmar = window.confirm(
        "Você está alterando o slug da pizzaria. Isso muda o link do cardápio público e pode quebrar links já compartilhados com clientes. Deseja continuar?",
      );
      if (!confirmar) return;
    }

    setSalvandoIdentidade(true);
    setMensagem(null);
    try {
      const atualizado = await pizzariaService.atualizar({
        nome: formIdentidade.nome,
        slug: formIdentidade.slug,
      });
      setPizzaria(atualizado);
      setFormIdentidade({ nome: atualizado.nome, slug: atualizado.slug });
      setMensagem({ tipo: "sucesso", texto: "Identidade atualizada com sucesso!" });
    } catch (err) {
      const mensagemErro = err instanceof Error ? err.message : "Erro ao salvar";
      setMensagem({ tipo: "erro", texto: mensagemErro });
    } finally {
      setSalvandoIdentidade(false);
    }
  }

  // ---- Salvar: Entrega e contato ----
  async function handleSalvarEntrega(e: React.FormEvent) {
    e.preventDefault();
    if (!pizzaria) return;

    const enderecoFinal = montarEnderecoString();
    const taxaTrimmed = formEntrega.taxaEntrega.trim();

    setSalvandoEntrega(true);
    setMensagem(null);
    try {
      const atualizado = await pizzariaService.atualizar({
        telefone: formEntrega.telefone,
        taxa_entrega: taxaTrimmed === "" ? null : Number(taxaTrimmed),
        ...(enderecoFinal ? { endereco: enderecoFinal } : {}),
      });
      setPizzaria(atualizado);
      setFormEntrega({
        telefone: atualizado.telefone || "",
        taxaEntrega:
          atualizado.taxa_entrega !== null && atualizado.taxa_entrega !== undefined
            ? String(atualizado.taxa_entrega)
            : "",
      });
      setEndereco({ cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "" });
      setMensagem({ tipo: "sucesso", texto: "Entrega e contato atualizados com sucesso!" });
    } catch (err) {
      const mensagemErro = err instanceof Error ? err.message : "Erro ao salvar";
      setMensagem({ tipo: "erro", texto: mensagemErro });
    } finally {
      setSalvandoEntrega(false);
    }
  }

  // ---- Adicionar bairro/taxa ----
  async function handleAdicionarLocalidade(e: React.FormEvent) {
    e.preventDefault();
    if (!novoBairro.trim() || !novaTaxa.trim()) return;

    setSalvandoLocalidade(true);
    setMensagem(null);
    try {
      const criada = await localidadeTaxaService.criar({
        bairro: novoBairro.trim(),
        taxa: Number(novaTaxa),
      });
      setLocalidades((prev) =>
        [...prev, criada].sort((a, b) => a.bairro.localeCompare(b.bairro)),
      );
      setNovoBairro("");
      setNovaTaxa("");
      setMensagem({ tipo: "sucesso", texto: "Bairro adicionado com sucesso!" });
    } catch (err) {
      const mensagemErro = err instanceof Error ? err.message : "Erro ao adicionar bairro";
      setMensagem({ tipo: "erro", texto: mensagemErro });
    } finally {
      setSalvandoLocalidade(false);
    }
  }

  // ---- Excluir bairro/taxa ----
  async function handleExcluirLocalidade(id: string) {
    const confirmar = window.confirm(
      "Remover esse bairro? Pedidos que caírem nele voltam a usar a taxa padrão.",
    );
    if (!confirmar) return;

    setExcluindoId(id);
    setMensagem(null);
    try {
      await localidadeTaxaService.excluir(id);
      setLocalidades((prev) => prev.filter((l) => l.id !== id));
      setMensagem({ tipo: "sucesso", texto: "Bairro removido com sucesso!" });
    } catch (err) {
      const mensagemErro = err instanceof Error ? err.message : "Erro ao remover bairro";
      setMensagem({ tipo: "erro", texto: mensagemErro });
    } finally {
      setExcluindoId(null);
    }
  }

  // ---- Editar bairro/taxa ----
  function handleIniciarEdicao(loc: LocalidadeTaxa) {
    setEditandoId(loc.id);
    setEditBairro(loc.bairro);
    setEditTaxa(String(loc.taxa));
  }

  function handleCancelarEdicao() {
    setEditandoId(null);
    setEditBairro("");
    setEditTaxa("");
  }

  async function handleSalvarEdicao(id: string) {
    if (!editBairro.trim() || !editTaxa.trim()) return;

    setSalvandoEdicaoId(id);
    setMensagem(null);
    try {
      const atualizada = await localidadeTaxaService.atualizar(id, {
        bairro: editBairro.trim(),
        taxa: Number(editTaxa),
      });
      setLocalidades((prev) =>
        prev
          .map((l) => (l.id === id ? atualizada : l))
          .sort((a, b) => a.bairro.localeCompare(b.bairro)),
      );
      setMensagem({ tipo: "sucesso", texto: "Bairro atualizado com sucesso!" });
      handleCancelarEdicao();
    } catch (err) {
      const mensagemErro = err instanceof Error ? err.message : "Erro ao atualizar bairro";
      setMensagem({ tipo: "erro", texto: mensagemErro });
    } finally {
      setSalvandoEdicaoId(null);
    }
  }

  // ---- Ativar/Desativar bairro ----
  async function handleAlternarAtivo(loc: LocalidadeTaxa) {
    setAlternandoAtivoId(loc.id);
    setMensagem(null);
    try {
      const atualizada = await localidadeTaxaService.atualizar(loc.id, {
        ativo: !loc.ativo,
      });
      setLocalidades((prev) => prev.map((l) => (l.id === loc.id ? atualizada : l)));
      setMensagem({
        tipo: "sucesso",
        texto: atualizada.ativo
          ? "Bairro reativado — voltou a aparecer no checkout."
          : "Bairro desativado — não aparece mais no checkout, mas o histórico é mantido.",
      });
    } catch (err) {
      const mensagemErro = err instanceof Error ? err.message : "Erro ao atualizar status";
      setMensagem({ tipo: "erro", texto: mensagemErro });
    } finally {
      setAlternandoAtivoId(null);
    }
  }

  // ---- Salvar: Impressão ----
  async function handleSalvarImpressao(e: React.FormEvent) {
    e.preventDefault();
    if (!pizzaria) return;

    setSalvandoImpressao(true);
    setMensagem(null);
    try {
      const atualizado = await pizzariaService.atualizar({
        largura_cupom: larguraCupom,
      });
      setPizzaria(atualizado);
      setLarguraCupom(atualizado.largura_cupom);
      setMensagem({ tipo: "sucesso", texto: "Configuração de impressão salva!" });
    } catch (err) {
      const mensagemErro = err instanceof Error ? err.message : "Erro ao salvar";
      setMensagem({ tipo: "erro", texto: mensagemErro });
    } finally {
      setSalvandoImpressao(false);
    }
  }

  async function handleSelecionarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setEnviandoLogo(true);
    setMensagem(null);
    try {
      const atualizado = await pizzariaService.uploadLogo(file);
      setPizzaria(atualizado);
      const agora = Date.now();
      setLogoCacheBuster(agora);
      window.localStorage.setItem("bella-pizz:logo-cache-buster", String(agora));
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
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Logo da pizzaria
        </label>
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

      {/* Card: Identidade */}
      <form
        onSubmit={handleSalvarIdentidade}
        className="space-y-5 bg-white border border-gray-200 rounded-xl p-6 mb-5"
      >
        <div>
          <h2 className="text-base font-semibold text-gray-900">Identidade</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Nome e link público do cardápio.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da pizzaria
          </label>
          <input
            value={formIdentidade.nome}
            onChange={(e) =>
              setFormIdentidade((prev) => ({ ...prev, nome: e.target.value }))
            }
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (link do cardápio)
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-red-500">
            <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-300 select-none whitespace-nowrap">
              {typeof window !== "undefined" ? window.location.origin : ""}/
            </span>
            <input
              value={formIdentidade.slug}
              onChange={(e) =>
                setFormIdentidade((prev) => ({ ...prev, slug: e.target.value }))
              }
              required
              className="flex-1 min-w-0 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/${formIdentidade.slug}`,
              );
            }}
            className="mt-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Copiar link completo
          </button>
        </div>

        <button
          type="submit"
          disabled={salvandoIdentidade}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2.5 rounded-lg transition"
        >
          {salvandoIdentidade ? "Salvando..." : "Salvar identidade"}
        </button>
      </form>

      {/* Card: Entrega e contato */}
      <form
        onSubmit={handleSalvarEntrega}
        className="space-y-5 bg-white border border-gray-200 rounded-xl p-6 mb-5"
      >
        <div>
          <h2 className="text-base font-semibold text-gray-900">Entrega e contato</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Telefone, endereço da pizzaria e taxa de entrega cobrada do cliente.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            value={formEntrega.telefone}
            onChange={(e) =>
              setFormEntrega((prev) => ({ ...prev, telefone: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço atual
          </label>
          <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3">
            {pizzaria?.endereco || "Nenhum endereço cadastrado"}
          </p>

          <p className="text-xs text-gray-500 mb-2">
            Preencha os campos abaixo para atualizar o endereço (isso substitui o
            endereço atual):
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

        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de entrega
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={formEntrega.taxaEntrega}
            onChange={(e) =>
              setFormEntrega((prev) => ({ ...prev, taxaEntrega: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Deixe em branco para não cobrar taxa de entrega. Essa é a taxa usada quando
            o bairro do cliente não estiver na lista abaixo.
          </p>
        </div>

        <button
          type="submit"
          disabled={salvandoEntrega}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2.5 rounded-lg transition"
        >
          {salvandoEntrega ? "Salvando..." : "Salvar entrega e contato"}
        </button>
      </form>

      {/* Card: Bairros e taxas de entrega */}
      <div className="space-y-5 bg-white border border-gray-200 rounded-xl p-6 mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Bairros e taxas de entrega
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Cadastre um valor diferente por bairro/localidade. Um bairro desativado
            some do checkout, mas o histórico dos pedidos antigos é preservado.
          </p>
        </div>

        {carregandoLocalidades ? (
          <p className="text-sm text-gray-400">Carregando bairros...</p>
        ) : (
          <>
            {localidades.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                Nenhum bairro cadastrado ainda.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg divide-y">
                {localidades.map((loc) => {
                  const emEdicao = editandoId === loc.id;

                  return (
                    <div
                      key={loc.id}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 text-sm ${
                        !loc.ativo && !emEdicao ? "bg-gray-50" : ""
                      }`}
                    >
                      {emEdicao ? (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            value={editBairro}
                            onChange={(e) => setEditBairro(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            autoFocus
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editTaxa}
                            onChange={(e) => setEditTaxa(e.target.value)}
                            className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSalvarEdicao(loc.id)}
                            disabled={
                              salvandoEdicaoId === loc.id ||
                              !editBairro.trim() ||
                              !editTaxa.trim()
                            }
                            className="text-green-600 hover:text-green-700 disabled:opacity-50 shrink-0"
                            title="Salvar"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelarEdicao}
                            disabled={salvandoEdicaoId === loc.id}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 shrink-0"
                            title="Cancelar"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`font-medium truncate ${
                                loc.ativo ? "text-gray-700" : "text-gray-400"
                              }`}
                            >
                              {loc.bairro}
                            </span>
                            {!loc.ativo && (
                              <span className="shrink-0 text-[11px] font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
                                Inativo
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={loc.ativo ? "text-gray-600" : "text-gray-400"}>
                              {Number(loc.taxa).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleAlternarAtivo(loc)}
                              disabled={alternandoAtivoId === loc.id}
                              title={loc.ativo ? "Desativar bairro" : "Reativar bairro"}
                              className={`relative w-9 h-5 rounded-full transition-colors disabled:opacity-50 ${
                                loc.ativo ? "bg-red-600" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                  loc.ativo ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleIniciarEdicao(loc)}
                              className="text-gray-400 hover:text-gray-700"
                              title="Editar bairro"
                            >
                              <FiEdit2 size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExcluirLocalidade(loc.id)}
                              disabled={excluindoId === loc.id}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                              title="Remover bairro"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <form
              onSubmit={handleAdicionarLocalidade}
              className="flex gap-2 items-start border-t border-gray-100 pt-4"
            >
              <input
                placeholder="Nome do bairro"
                value={novoBairro}
                onChange={(e) => setNovoBairro(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Taxa"
                value={novaTaxa}
                onChange={(e) => setNovaTaxa(e.target.value)}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                disabled={salvandoLocalidade || !novoBairro.trim() || !novaTaxa.trim()}
                className="shrink-0 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg px-3 py-2"
                title="Adicionar bairro"
              >
                <FiPlus size={16} />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Card: Impressão */}
      <form
        onSubmit={handleSalvarImpressao}
        className="space-y-5 bg-white border border-gray-200 rounded-xl p-6 mb-5"
      >
        <div>
          <h2 className="text-base font-semibold text-gray-900">Impressão</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configuração da impressora térmica de cupons.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Largura do cupom de impressão
          </label>
          <select
            value={larguraCupom}
            onChange={(e) => setLarguraCupom(e.target.value as "58mm" | "80mm")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="58mm">58mm</option>
            <option value="80mm">80mm</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Escolha conforme a largura do rolo de papel da sua impressora térmica.
          </p>
        </div>

        <button
          type="submit"
          disabled={salvandoImpressao}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2.5 rounded-lg transition"
        >
          {salvandoImpressao ? "Salvando..." : "Salvar impressão"}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plano atual
        </label>
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 capitalize">
          {pizzaria?.plano}
        </p>
      </div>
    </div>
  );
}