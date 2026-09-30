"use client";

import { useEffect, useRef, useState } from "react";
import { pizzariaService } from "@/server/pizzaria.service";
import {
  localidadeTaxaService,
  LocalidadeTaxa,
} from "@/server/localidadeTaxa.service";
import { PizzariaMe } from "@/types/pizzaria";
import {
  FiTrash2,
  FiPlus,
  FiEdit2,
  FiCheck,
  FiX,
  FiCopy,
  FiExternalLink,
} from "react-icons/fi";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function tratarValorMoeda(
  valor: string | number | undefined | null,
): number | undefined {
  if (valor === undefined || valor === null || valor === "") return undefined;
  const str = String(valor).replace(",", ".");
  const num = Number(str);
  return isNaN(num) ? undefined : num;
}

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        checked ? "bg-red-600" : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-2xs ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

export default function ConfiguracoesPage() {
  const [pizzaria, setPizzaria] = useState<PizzariaMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);
  const [logoCacheBuster, setLogoCacheBuster] = useState<number | null>(null);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const inputLogoRef = useRef<HTMLInputElement>(null);

  // ---- Identidade ----
  const [formIdentidade, setFormIdentidade] = useState({ nome: "", slug: "" });
  const [salvandoIdentidade, setSalvandoIdentidade] = useState(false);

  // ---- Entrega e Contato ----
  const [formEntrega, setFormEntrega] = useState({
    telefone: "",
    taxaEntrega: "",
  });
  const [endereco, setEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [salvandoEntrega, setSalvandoEntrega] = useState(false);

  // ---- Bairros e Taxas ----
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
  const [alternandoAtivoId, setAlternandoAtivoId] = useState<string | null>(
    null,
  );

  // ---- Impressão ----
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
        setLarguraCupom(dados.largura_cupom || "80mm");
      } catch (err) {
        console.error(err);
        setMensagem({
          tipo: "erro",
          texto: "Erro ao carregar dados da pizzaria",
        });
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

  // Busca de CEP Automática via ViaCEP
  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cepLimpo = e.target.value.replace(/\D/g, "").slice(0, 8);
    setEndereco((prev) => ({ ...prev, cep: cepLimpo }));

    if (cepLimpo.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEndereco((prev) => ({
            ...prev,
            rua: data.logradouro || prev.rua,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
          }));
        }
      } catch {
        // Fallback silencioso
      } finally {
        setBuscandoCep(false);
      }
    }
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
      cep ? `CEP ${cep}` : "",
    ].filter(Boolean);
    return partes.join(", ");
  }

  function copiarLinkCardapio() {
    if (typeof window === "undefined" || !formIdentidade.slug) return;
    const url = `${window.location.origin}/${formIdentidade.slug}`;
    navigator.clipboard.writeText(url);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  // ---- Salvar Identidade ----
  async function handleSalvarIdentidade(e: React.FormEvent) {
    e.preventDefault();
    if (!pizzaria) return;

    if (formIdentidade.slug !== pizzaria.slug) {
      const confirmar = window.confirm(
        "Você está alterando o link do cardápio público da sua pizzaria. Links antigos já compartilhados no WhatsApp ou Instagram deixarão de funcionar. Deseja prosseguir?",
      );
      if (!confirmar) return;
    }

    setSalvandoIdentidade(true);
    setMensagem(null);
    try {
      const atualizado = await pizzariaService.atualizar({
        nome: formIdentidade.nome.trim(),
        slug: formIdentidade.slug.trim().toLowerCase(),
      });
      setPizzaria(atualizado);
      setFormIdentidade({ nome: atualizado.nome, slug: atualizado.slug });
      setMensagem({
        tipo: "sucesso",
        texto: "Identidade atualizada com sucesso!",
      });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err instanceof Error ? err.message : "Erro ao salvar identidade",
      });
    } finally {
      setSalvandoIdentidade(false);
    }
  }

  // ---- Salvar Entrega e Contato ----
  async function handleSalvarEntrega(e: React.FormEvent) {
    e.preventDefault();
    if (!pizzaria) return;

    const enderecoFinal = montarEnderecoString();
    const taxaNum = tratarValorMoeda(formEntrega.taxaEntrega);

    setSalvandoEntrega(true);
    setMensagem(null);
    try {
      const atualizado = await pizzariaService.atualizar({
        telefone: formEntrega.telefone.trim(),
        taxa_entrega: taxaNum === undefined ? null : taxaNum,
        ...(enderecoFinal ? { endereco: enderecoFinal } : {}),
      });
      setPizzaria(atualizado);
      setFormEntrega({
        telefone: atualizado.telefone || "",
        taxaEntrega:
          atualizado.taxa_entrega !== null &&
          atualizado.taxa_entrega !== undefined
            ? String(atualizado.taxa_entrega)
            : "",
      });
      setEndereco({
        cep: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
      });
      setMensagem({
        tipo: "sucesso",
        texto: "Entrega e contato atualizados com sucesso!",
      });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err instanceof Error ? err.message : "Erro ao salvar",
      });
    } finally {
      setSalvandoEntrega(false);
    }
  }

  // ---- Adicionar Bairro/Taxa ----
  async function handleAdicionarLocalidade(e: React.FormEvent) {
    e.preventDefault();
    const taxaNum = tratarValorMoeda(novaTaxa);
    if (!novoBairro.trim() || taxaNum === undefined) {
      setMensagem({
        tipo: "erro",
        texto: "Informe o nome do bairro e um valor de taxa válido.",
      });
      return;
    }

    setSalvandoLocalidade(true);
    setMensagem(null);
    try {
      const criada = await localidadeTaxaService.criar({
        bairro: novoBairro.trim(),
        taxa: taxaNum,
      });
      setLocalidades((prev) =>
        [...prev, criada].sort((a, b) => a.bairro.localeCompare(b.bairro)),
      );
      setNovoBairro("");
      setNovaTaxa("");
      setMensagem({ tipo: "sucesso", texto: "Bairro adicionado com sucesso!" });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err instanceof Error ? err.message : "Erro ao adicionar bairro",
      });
    } finally {
      setSalvandoLocalidade(false);
    }
  }

  // ---- Excluir Bairro/Taxa ----
  async function handleExcluirLocalidade(id: string) {
    const confirmado = window.confirm(
      "Remover esse bairro? Os pedidos dessa região voltarão a usar a taxa padrão da pizzaria.",
    );
    if (!confirmado) return;

    setExcluindoId(id);
    setMensagem(null);
    try {
      await localidadeTaxaService.excluir(id);
      setLocalidades((prev) => prev.filter((l) => l.id !== id));
      setMensagem({ tipo: "sucesso", texto: "Bairro removido com sucesso!" });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err instanceof Error ? err.message : "Erro ao remover bairro",
      });
    } finally {
      setExcluindoId(null);
    }
  }

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
    const taxaNum = tratarValorMoeda(editTaxa);
    if (!editBairro.trim() || taxaNum === undefined) return;

    setSalvandoEdicaoId(id);
    setMensagem(null);
    try {
      const atualizada = await localidadeTaxaService.atualizar(id, {
        bairro: editBairro.trim(),
        taxa: taxaNum,
      });
      setLocalidades((prev) =>
        prev
          .map((l) => (l.id === id ? atualizada : l))
          .sort((a, b) => a.bairro.localeCompare(b.bairro)),
      );
      setMensagem({ tipo: "sucesso", texto: "Bairro atualizado com sucesso!" });
      handleCancelarEdicao();
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err instanceof Error ? err.message : "Erro ao atualizar bairro",
      });
    } finally {
      setSalvandoEdicaoId(null);
    }
  }

  async function handleAlternarAtivo(loc: LocalidadeTaxa) {
    setAlternandoAtivoId(loc.id);
    setMensagem(null);
    try {
      const atualizada = await localidadeTaxaService.atualizar(loc.id, {
        ativo: !loc.ativo,
      });
      setLocalidades((prev) =>
        prev.map((l) => (l.id === loc.id ? atualizada : l)),
      );
      setMensagem({
        tipo: "sucesso",
        texto: atualizada.ativo
          ? `Bairro "${atualizada.bairro}" ativado para entregas.`
          : `Bairro "${atualizada.bairro}" pausado no checkout.`,
      });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto:
          err instanceof Error
            ? err.message
            : "Erro ao alterar status do bairro",
      });
    } finally {
      setAlternandoAtivoId(null);
    }
  }

  // ---- Salvar Impressão ----
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
      setMensagem({
        tipo: "sucesso",
        texto: "Formato de impressão salvo com sucesso!",
      });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto:
          err instanceof Error
            ? err.message
            : "Erro ao salvar formato de impressão",
      });
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
      window.localStorage.setItem(
        "forno-menu:logo-cache-buster",
        String(agora),
      );
      setMensagem({
        tipo: "sucesso",
        texto: "Logomarca atualizada com sucesso!",
      });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err instanceof Error ? err.message : "Erro ao enviar logomarca",
      });
    } finally {
      setEnviandoLogo(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-2.5 text-neutral-500">
        <div className="w-7 h-7 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">
          Carregando configurações da pizzaria...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Topo da Página */}
      <header>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Configurações da Pizzaria
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Personalize a identidade da loja, taxas de entrega por bairro e
          impressora térmica
        </p>
      </header>

      {/* Alerta de Feedback Flutuante / Fixo */}
      {mensagem && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold border shadow-2xs ${
            mensagem.tipo === "sucesso"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{mensagem.texto}</span>
          <button
            onClick={() => setMensagem(null)}
            className="text-xs underline hover:no-underline ml-3 font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* CARD 1: LOGO E IDENTIDADE VISUAL */}
      <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏪</span>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Logomarca & Apresentação
              </h2>
              <p className="text-[11px] text-neutral-400">
                A foto de perfil que aparece no topo do seu cardápio digital
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-20 h-20 rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
            {pizzaria?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${pizzaria.logo_url}${logoCacheBuster ? `?t=${logoCacheBuster}` : ""}`}
                alt="Logo da pizzaria"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🍕</span>
            )}
          </div>

          <div className="space-y-1.5">
            <input
              ref={inputLogoRef}
              type="file"
              accept="image/*"
              onChange={handleSelecionarLogo}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputLogoRef.current?.click()}
                disabled={enviandoLogo}
                className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-xl px-3.5 py-2 transition-colors shadow-2xs"
              >
                {enviandoLogo ? "Enviando imagem..." : "Trocar Logomarca"}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Formatos recomendados: PNG ou JPG em formato quadrado (mín.
              400x400px).
            </p>
          </div>
        </div>
      </section>

      {/* CARD 2: NOME E LINK DO CARDÁPIO (SLUG) */}
      <form
        onSubmit={handleSalvarIdentidade}
        className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔗</span>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Nome & Link Público
              </h2>
              <p className="text-[11px] text-neutral-400">
                O endereço web que você compartilha nas redes e WhatsApp
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Nome da Pizzaria *
          </label>
          <input
            value={formIdentidade.nome}
            onChange={(e) =>
              setFormIdentidade((prev) => ({ ...prev, nome: e.target.value }))
            }
            required
            placeholder="Ex: Bella Pizza Artesanal"
            className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Link Curto / Slug *
          </label>
          <div className="flex rounded-xl border border-neutral-300 overflow-hidden focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10 bg-neutral-50">
            <span className="flex items-center px-3 text-xs font-mono text-neutral-500 border-r border-neutral-200 select-none">
              {typeof window !== "undefined" ? window.location.host : "app"}/
            </span>
            <input
              value={formIdentidade.slug}
              onChange={(e) =>
                setFormIdentidade((prev) => ({
                  ...prev,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-_]/g, ""),
                }))
              }
              required
              placeholder="sua-pizzaria"
              className="flex-1 min-w-0 px-3 py-2 text-sm font-mono focus:outline-none bg-white"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={copiarLinkCardapio}
              className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 transition-colors"
            >
              {linkCopiado ? (
                <>
                  <FiCheck className="text-emerald-600" />
                  <span className="text-emerald-700">
                    Link copiado para a área de transferência!
                  </span>
                </>
              ) : (
                <>
                  <FiCopy />
                  <span>Copiar link do cardápio</span>
                </>
              )}
            </button>

            {formIdentidade.slug && (
              <a
                href={`/${formIdentidade.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-neutral-500 hover:text-neutral-800 inline-flex items-center gap-1"
              >
                <FiExternalLink />
                <span>Testar abertura</span>
              </a>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-neutral-100">
          <button
            type="submit"
            disabled={salvandoIdentidade || !formIdentidade.nome.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            {salvandoIdentidade ? "Salvando..." : "Salvar Identidade"}
          </button>
        </div>
      </form>

      {/* CARD 3: ENTREGA, ENDEREÇO E CONTATO */}
      <form
        onSubmit={handleSalvarEntrega}
        className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Endereço & Contato
              </h2>
              <p className="text-[11px] text-neutral-400">
                Localização da loja física e taxa padrão de entrega
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              WhatsApp / Telefone da Loja
            </label>
            <input
              value={formEntrega.telefone}
              onChange={(e) =>
                setFormEntrega((prev) => ({
                  ...prev,
                  telefone: e.target.value,
                }))
              }
              placeholder="(11) 98765-4321"
              className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Taxa Padrão de Entrega (R$)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ex: 7.00 (ou vazio p/ grátis)"
              value={formEntrega.taxaEntrega}
              onChange={(e) =>
                setFormEntrega((prev) => ({
                  ...prev,
                  taxaEntrega: e.target.value,
                }))
              }
              className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 font-mono"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              Cobrada caso o cliente more em um bairro fora da tabela abaixo.
            </p>
          </div>
        </div>

        {/* Endereço Atual */}
        <div>
          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Endereço Cadastrado
          </label>
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700">
            {pizzaria?.endereco ? (
              <p className="font-medium">📍 {pizzaria.endereco}</p>
            ) : (
              <p className="text-neutral-400 italic">
                Nenhum endereço cadastrado no momento.
              </p>
            )}
          </div>
        </div>

        {/* Campos para Atualização com CEP automático */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold text-neutral-800">
            Atualizar Endereço da Pizzaria:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 block mb-0.5">
                CEP {buscandoCep && "(Buscando...)"}
              </label>
              <input
                name="cep"
                placeholder="00000-000"
                value={endereco.cep}
                onChange={handleCepChange}
                maxLength={8}
                className="w-full border border-neutral-300 rounded-xl px-3 py-1.5 text-xs focus:border-red-500 focus:outline-none font-mono"
              />
            </div>

            <div className="col-span-1 sm:col-span-3">
              <label className="text-[10px] font-bold text-neutral-400 block mb-0.5">
                Rua / Avenida
              </label>
              <input
                name="rua"
                placeholder="Ex: Rua das Flores"
                value={endereco.rua}
                onChange={handleEnderecoChange}
                className="w-full border border-neutral-300 rounded-xl px-3 py-1.5 text-xs focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 block mb-0.5">
                Número
              </label>
              <input
                name="numero"
                placeholder="Ex: 120"
                value={endereco.numero}
                onChange={handleEnderecoChange}
                className="w-full border border-neutral-300 rounded-xl px-3 py-1.5 text-xs focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 block mb-0.5">
                Bairro
              </label>
              <input
                name="bairro"
                placeholder="Bairro"
                value={endereco.bairro}
                onChange={handleEnderecoChange}
                className="w-full border border-neutral-300 rounded-xl px-3 py-1.5 text-xs focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 block mb-0.5">
                Cidade
              </label>
              <input
                name="cidade"
                placeholder="Cidade"
                value={endereco.cidade}
                onChange={handleEnderecoChange}
                className="w-full border border-neutral-300 rounded-xl px-3 py-1.5 text-xs focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 block mb-0.5">
                UF
              </label>
              <input
                name="estado"
                placeholder="SP"
                maxLength={2}
                value={endereco.estado}
                onChange={handleEnderecoChange}
                className="w-full border border-neutral-300 rounded-xl px-3 py-1.5 text-xs focus:border-red-500 focus:outline-none text-center uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-neutral-100">
          <button
            type="submit"
            disabled={salvandoEntrega}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            {salvandoEntrega ? "Salvando..." : "Salvar Endereço e Contato"}
          </button>
        </div>
      </form>

      {/* CARD 4: BAIRROS E TAXAS DE ENTREGA */}
      <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛵</span>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Taxas de Entrega por Bairro
              </h2>
              <p className="text-[11px] text-neutral-400">
                Valores personalizados calculados automaticamente no checkout do
                cliente
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full">
            {localidades.length} bairros
          </span>
        </div>

        {/* Cadastro Rápido de Bairro */}
        <form onSubmit={handleAdicionarLocalidade} className="flex gap-2">
          <input
            placeholder="Nome do bairro (ex: Centro, Vila Nova...)"
            value={novoBairro}
            onChange={(e) => setNovoBairro(e.target.value)}
            className="flex-1 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none bg-neutral-50/50 focus:bg-white"
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="R$ 8,00"
            value={novaTaxa}
            onChange={(e) => setNovaTaxa(e.target.value)}
            className="w-24 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none bg-neutral-50/50 focus:bg-white font-mono text-center"
          />
          <button
            type="submit"
            disabled={
              salvandoLocalidade || !novoBairro.trim() || !novaTaxa.trim()
            }
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl px-3.5 py-2 text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 shrink-0"
          >
            <FiPlus />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </form>

        {/* Lista de Bairros */}
        {carregandoLocalidades ? (
          <p className="text-xs text-neutral-400 py-4 text-center">
            Carregando bairros...
          </p>
        ) : localidades.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-neutral-200 rounded-xl text-neutral-400 text-xs">
            Nenhum bairro cadastrado. A pizzaria cobrará a taxa padrão para
            todas as entregas.
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden">
            {localidades.map((loc) => {
              const emEdicao = editandoId === loc.id;

              return (
                <div
                  key={loc.id}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs transition-colors ${
                    !loc.ativo && !emEdicao
                      ? "bg-neutral-50/70"
                      : "bg-white hover:bg-neutral-50/40"
                  }`}
                >
                  {emEdicao ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        value={editBairro}
                        onChange={(e) => setEditBairro(e.target.value)}
                        className="flex-1 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500"
                        autoFocus
                      />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={editTaxa}
                        onChange={(e) => setEditTaxa(e.target.value)}
                        className="w-24 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500 font-mono text-center"
                      />
                      <button
                        type="button"
                        onClick={() => handleSalvarEdicao(loc.id)}
                        disabled={
                          salvandoEdicaoId === loc.id || !editBairro.trim()
                        }
                        className="text-emerald-600 hover:text-emerald-700 p-1"
                        title="Salvar"
                      >
                        <FiCheck size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelarEdicao}
                        className="text-neutral-400 hover:text-neutral-600 p-1"
                        title="Cancelar"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-semibold truncate ${
                            loc.ativo
                              ? "text-neutral-800"
                              : "text-neutral-400 line-through"
                          }`}
                        >
                          {loc.bairro}
                        </span>
                        {!loc.ativo && (
                          <span className="shrink-0 text-[10px] font-semibold text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.2">
                            Pausado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`font-mono font-bold ${
                            loc.ativo ? "text-neutral-700" : "text-neutral-400"
                          }`}
                        >
                          {formatarMoeda(Number(loc.taxa))}
                        </span>

                        <div className="flex items-center gap-1.5 mr-1">
                          <Toggle
                            checked={loc.ativo}
                            onChange={() => handleAlternarAtivo(loc)}
                            disabled={alternandoAtivoId === loc.id}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleIniciarEdicao(loc)}
                          className="text-neutral-400 hover:text-neutral-700 p-1 rounded hover:bg-neutral-100 transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExcluirLocalidade(loc.id)}
                          disabled={excluindoId === loc.id}
                          className="text-neutral-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CARD 5: IMPRESSORA TÉRMICA & BOBINA */}
      <form
        onSubmit={handleSalvarImpressao}
        className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🖨️</span>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Impressão Térmica de Cupons
              </h2>
              <p className="text-[11px] text-neutral-400">
                Ajuste a formatação do cupom para a largura da sua impressora
              </p>
            </div>
          </div>
        </div>

        {/* Escolha com Cards de Bobina */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`border-2 rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
              larguraCupom === "80mm"
                ? "border-red-600 bg-red-50/30"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <input
              type="radio"
              name="largura_cupom"
              value="80mm"
              checked={larguraCupom === "80mm"}
              onChange={() => setLarguraCupom("80mm")}
              className="mt-1 text-red-600 focus:ring-red-500"
            />
            <div>
              <p className="font-bold text-xs text-neutral-900">
                Bobina 80mm (Padrão)
              </p>
              <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                Mais larga, excelente legibilidade para impressoras térmicas de
                balcão e cozinha (Epson, Bematech, Elgin).
              </p>
            </div>
          </label>

          <label
            className={`border-2 rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
              larguraCupom === "58mm"
                ? "border-red-600 bg-red-50/30"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <input
              type="radio"
              name="largura_cupom"
              value="58mm"
              checked={larguraCupom === "58mm"}
              onChange={() => setLarguraCupom("58mm")}
              className="mt-1 text-red-600 focus:ring-red-500"
            />
            <div>
              <p className="font-bold text-xs text-neutral-900">
                Bobina 58mm (Compacta)
              </p>
              <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                Mini impressoras portáteis ou maquininhas POS com bobina
                estreita de cupom.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-2 border-t border-neutral-100">
          <button
            type="submit"
            disabled={salvandoImpressao}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            {salvandoImpressao
              ? "Salvando..."
              : "Salvar Configuração de Impressão"}
          </button>
        </div>
      </form>

      {/* CARD 6: PLANO DA CONTA */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 block leading-none">
            Plano da Licença
          </span>
          <p className="text-sm font-bold text-neutral-800 capitalize mt-1">
            Plano {pizzaria?.plano || "Profissional"}
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Assinatura Ativa
        </span>
      </div>
    </div>
  );
}
