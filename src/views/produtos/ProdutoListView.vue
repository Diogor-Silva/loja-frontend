<template>
  <div>
    <div
        class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6"
    >
      <div>
        <h1 class="text-h4 font-weight-bold">
          Produtos
        </h1>

        <p class="text-medium-emphasis mt-2 mb-0">
          Cadastro e gerenciamento de produtos.
        </p>
      </div>

      <v-btn
          color="primary"
          prepend-icon="mdi-package-variant-plus"
          rounded="lg"
          size="large"
          @click="abrirCadastro"
      >
        Novo produto
      </v-btn>
    </div>

    <v-card rounded="lg" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
                v-model="pesquisa"
                label="Pesquisar produto"
                placeholder="Digite nome, marca, categoria ou código de barras"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-data-table
          :headers="headers"
          :items="produtos"
          :search="pesquisa"
          :loading="carregando"
          loading-text="Carregando produtos..."
          item-value="id"
          hover
      >
        <template v-slot:[`item.codigoBarra`]="{ item }">
          <span v-if="item.codigoBarra">
            {{ item.codigoBarra }}
          </span>

          <span v-else class="text-medium-emphasis">
            Não informado
          </span>
        </template>

        <template v-slot:[`item.preco`]="{ item }">
          {{ formatarMoeda(item.preco) }}
        </template>

        <template v-slot:[`item.quantidadeEstoque`]="{ item }">
          <v-chip
              :color="corEstoque(item.quantidadeEstoque)"
              variant="tonal"
              size="small"
          >
            {{ item.quantidadeEstoque }}
          </v-chip>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-chip
              :color="corEstoque(item.quantidadeEstoque)"
              variant="tonal"
              size="small"
          >
            {{ textoStatusEstoque(item.quantidadeEstoque) }}
          </v-chip>
        </template>

        <template v-slot:[`item.acoes`]="{ item }">
          <div class="d-flex justify-center align-center ga-1">
            <v-tooltip text="Editar produto">
              <template #activator="{ props }">
                <v-btn
                    v-bind="props"
                    icon="mdi-pencil-outline"
                    variant="text"
                    color="primary"
                    size="small"
                    :disabled="salvando || excluindo"
                    @click="editarProduto(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Excluir produto">
              <template #activator="{ props }">
                <v-btn
                    v-bind="props"
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    size="small"
                    :disabled="salvando || excluindo"
                    @click="confirmarExclusao(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #no-data>
          <div class="pa-8 text-center text-medium-emphasis">
            Nenhum produto encontrado.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
        v-model="dialogCadastro"
        max-width="920"
        persistent
    >
      <v-card rounded="lg">
        <v-card-title
            class="d-flex align-center justify-space-between pa-6"
        >
          <span class="text-h5 font-weight-bold">
            {{ produtoEmEdicao ? "Editar produto" : "Novo produto" }}
          </span>

          <v-btn
              icon="mdi-close"
              variant="text"
              :disabled="salvando"
              @click="fecharCadastro"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-form ref="formProduto">
            <v-row>
              <v-col cols="12">
                <v-text-field
                    v-model="form.nome"
                    label="Nome"
                    variant="outlined"
                    maxlength="120"
                    :disabled="salvando"
                    :rules="[regras.obrigatorio, regras.nome]"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                    v-model="form.descricao"
                    label="Descrição"
                    variant="outlined"
                    rows="3"
                    maxlength="500"
                    counter="500"
                    auto-grow
                    :disabled="salvando"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                    v-model="form.categoria"
                    label="Categoria"
                    variant="outlined"
                    maxlength="80"
                    :disabled="salvando"
                    :rules="[regras.obrigatorio]"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                    v-model="form.marca"
                    label="Marca"
                    variant="outlined"
                    maxlength="80"
                    :disabled="salvando"
                    :rules="[regras.obrigatorio]"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                    :model-value="form.codigoBarra"
                    label="Código de barras"
                    variant="outlined"
                    inputmode="numeric"
                    maxlength="13"
                    :disabled="salvando"
                    :rules="[regras.codigoBarra]"
                    @update:model-value="
                    form.codigoBarra = somenteNumeros($event, 13)
                  "
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                    :model-value="form.preco"
                    label="Preço"
                    prefix="R$"
                    variant="outlined"
                    inputmode="decimal"
                    :disabled="salvando"
                    :rules="[regras.obrigatorio, regras.preco]"
                    @update:model-value="
                    form.preco = formatarCampoPreco($event)
                  "
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                    :model-value="form.quantidadeEstoque"
                    label="Quantidade em estoque"
                    variant="outlined"
                    inputmode="numeric"
                    maxlength="6"
                    :disabled="salvando"
                    :rules="[regras.obrigatorio, regras.estoque]"
                    @update:model-value="
                    form.quantidadeEstoque = somenteNumeros($event, 6)
                  "
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-6">
          <v-spacer />

          <v-btn
              variant="text"
              :disabled="salvando"
              @click="fecharCadastro"
          >
            Cancelar
          </v-btn>

          <v-btn
              color="primary"
              rounded="lg"
              :loading="salvando"
              :disabled="salvando"
              @click="salvarProduto"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
        v-model="dialogExclusao"
        max-width="430"
        persistent
    >
      <v-card rounded="lg">
        <v-card-title class="text-h5 font-weight-bold pa-6">
          Excluir produto
        </v-card-title>

        <v-card-text class="px-6">
          Deseja realmente excluir
          <strong>{{ produtoSelecionado?.nome }}</strong>?
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer />

          <v-btn
              variant="text"
              :disabled="excluindo"
              @click="fecharExclusao"
          >
            Cancelar
          </v-btn>

          <v-btn
              color="error"
              rounded="lg"
              :loading="excluindo"
              :disabled="excluindo"
              @click="excluirProduto"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
        v-model="snackbar.aberto"
        :color="snackbar.cor"
        location="top right"
        :timeout="4500"
    >
      {{ snackbar.mensagem }}

      <template #actions>
        <v-btn
            variant="text"
            @click="snackbar.aberto = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import produtoService from "@/services/produtoService";

export default {
  name: "ProdutoListView",

  data() {
    return {
      pesquisa: "",
      dialogCadastro: false,
      dialogExclusao: false,

      produtoEmEdicao: false,
      produtoSelecionado: null,

      carregando: false,
      salvando: false,
      excluindo: false,

      snackbar: {
        aberto: false,
        mensagem: "",
        cor: "success",
      },

      headers: [
        {
          title: "Nome",
          key: "nome",
        },
        {
          title: "Categoria",
          key: "categoria",
        },
        {
          title: "Marca",
          key: "marca",
        },
        {
          title: "Código de barras",
          key: "codigoBarra",
        },
        {
          title: "Preço",
          key: "preco",
        },
        {
          title: "Estoque",
          key: "quantidadeEstoque",
          align: "center",
        },
        {
          title: "Status",
          key: "status",
          align: "center",
          sortable: false,
        },
        {
          title: "Ações",
          key: "acoes",
          sortable: false,
          align: "center",
          width: 140,
        },
      ],

      produtos: [],

      form: {
        id: null,
        nome: "",
        descricao: "",
        categoria: "",
        marca: "",
        codigoBarra: "",
        preco: "",
        quantidadeEstoque: "",
      },

      regras: {
        obrigatorio: (valor) =>
            Boolean(String(valor ?? "").trim()) ||
            "Campo obrigatório",

        nome: (valor) => {
          const nome = String(valor || "").trim();

          return (
              nome.length >= 3 ||
              "Nome deve possuir pelo menos 3 caracteres"
          );
        },

        codigoBarra: (valor) => {
          const codigo = String(valor || "").replace(/\D/g, "");

          if (!codigo) {
            return true;
          }

          return (
              codigo.length === 13 ||
              "Código de barras deve possuir 13 números"
          );
        },

        preco: (valor) => {
          const preco = Number(
              String(valor || "").replace(",", ".")
          );

          return (
              preco > 0 ||
              "Preço deve ser maior que zero"
          );
        },

        estoque: (valor) => {
          const estoque = Number(valor);

          return (
              (
                  Number.isInteger(estoque) &&
                  estoque >= 0
              ) ||
              "Estoque deve ser zero ou maior"
          );
        },
      },
    };
  },

  mounted() {
    this.carregarProdutos();
  },

  methods: {
    async carregarProdutos() {
      this.carregando = true;

      try {
        const resposta = await produtoService.listar();

        this.produtos = Array.isArray(resposta.data)
            ? resposta.data
            : [];
      } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);

        this.produtos = [];

        this.exibirMensagem(
            this.obterMensagemErro(
                erro,
                "Não foi possível carregar os produtos."
            ),
            "error"
        );
      } finally {
        this.carregando = false;
      }
    },

    abrirCadastro() {
      this.produtoEmEdicao = false;
      this.produtoSelecionado = null;
      this.limparFormulario();
      this.dialogCadastro = true;
    },

    editarProduto(produto) {
      this.produtoEmEdicao = true;
      this.produtoSelecionado = produto;

      this.form = {
        id: produto.id,
        nome: produto.nome || "",
        descricao: produto.descricao || "",
        categoria: produto.categoria || "",
        marca: produto.marca || "",
        codigoBarra: produto.codigoBarra || "",
        preco: this.converterPrecoParaCampo(produto.preco),
        quantidadeEstoque: String(
            produto.quantidadeEstoque ?? ""
        ),
      };

      this.dialogCadastro = true;
    },

    fecharCadastro() {
      if (this.salvando) {
        return;
      }

      this.dialogCadastro = false;
      this.produtoEmEdicao = false;
      this.produtoSelecionado = null;
      this.limparFormulario();

      this.$nextTick(() => {
        if (this.$refs.formProduto) {
          this.$refs.formProduto.resetValidation();
        }
      });
    },

    async salvarProduto() {
      if (!this.$refs.formProduto) {
        return;
      }

      const resultado = await this.$refs.formProduto.validate();

      if (!resultado.valid) {
        this.exibirMensagem(
            "Corrija os campos destacados antes de salvar.",
            "error"
        );
        return;
      }

      if (this.codigoBarraJaCadastrado(this.form.codigoBarra)) {
        this.exibirMensagem(
            "Já existe um produto com este código de barras.",
            "error"
        );
        return;
      }

      const produtoRequest = {
        nome: String(this.form.nome || "").trim(),
        descricao: String(this.form.descricao || "").trim(),
        categoria: String(this.form.categoria || "").trim(),
        marca: String(this.form.marca || "").trim(),
        codigoBarra:
            String(this.form.codigoBarra || "").trim() || null,
        preco: this.converterPrecoParaNumero(this.form.preco),
        quantidadeEstoque: Number(this.form.quantidadeEstoque),
      };

      this.salvando = true;

      try {
        if (this.produtoEmEdicao && this.form.id) {
          await produtoService.atualizar(
              this.form.id,
              produtoRequest
          );

          this.exibirMensagem(
              "Produto atualizado com sucesso.",
              "success"
          );
        } else {
          await produtoService.salvar(produtoRequest);

          this.exibirMensagem(
              "Produto cadastrado com sucesso.",
              "success"
          );
        }

        this.dialogCadastro = false;
        this.produtoEmEdicao = false;
        this.produtoSelecionado = null;
        this.limparFormulario();

        await this.carregarProdutos();
      } catch (erro) {
        console.error("Erro ao salvar produto:", erro);

        this.exibirMensagem(
            this.obterMensagemErro(
                erro,
                "Não foi possível salvar o produto."
            ),
            "error"
        );
      } finally {
        this.salvando = false;
      }
    },

    confirmarExclusao(produto) {
      this.produtoSelecionado = produto;
      this.dialogExclusao = true;
    },

    fecharExclusao() {
      if (this.excluindo) {
        return;
      }

      this.dialogExclusao = false;
      this.produtoSelecionado = null;
    },

    async excluirProduto() {
      if (!this.produtoSelecionado?.id) {
        return;
      }

      this.excluindo = true;

      try {
        await produtoService.excluir(
            this.produtoSelecionado.id
        );

        this.dialogExclusao = false;
        this.produtoSelecionado = null;

        this.exibirMensagem(
            "Produto excluído com sucesso.",
            "success"
        );

        await this.carregarProdutos();
      } catch (erro) {
        console.error("Erro ao excluir produto:", erro);

        this.exibirMensagem(
            this.obterMensagemErro(
                erro,
                "Não foi possível excluir o produto."
            ),
            "error"
        );
      } finally {
        this.excluindo = false;
      }
    },

    limparFormulario() {
      this.form = {
        id: null,
        nome: "",
        descricao: "",
        categoria: "",
        marca: "",
        codigoBarra: "",
        preco: "",
        quantidadeEstoque: "",
      };
    },

    codigoBarraJaCadastrado(codigoBarra) {
      const codigo = String(codigoBarra || "")
          .replace(/\D/g, "")
          .trim();

      if (!codigo) {
        return false;
      }

      return this.produtos.some((produto) => {
        const codigoProduto = String(
            produto.codigoBarra || ""
        )
            .replace(/\D/g, "")
            .trim();

        return (
            codigoProduto === codigo &&
            produto.id !== this.form.id
        );
      });
    },

    somenteNumeros(valor, limite) {
      return String(valor || "")
          .replace(/\D/g, "")
          .slice(0, limite);
    },

    formatarCampoPreco(valor) {
      let preco = String(valor ?? "")
          .replace(/[^\d,]/g, "");

      const primeiraVirgula = preco.indexOf(",");

      if (primeiraVirgula !== -1) {
        const parteInteira = preco.slice(0, primeiraVirgula);
        const parteDecimal = preco
            .slice(primeiraVirgula + 1)
            .replace(/,/g, "")
            .slice(0, 2);

        preco = `${parteInteira},${parteDecimal}`;
      }

      return preco.slice(0, 12);
    },

    converterPrecoParaNumero(valor) {
      const precoNormalizado = String(valor ?? "")
          .replace(/\./g, "")
          .replace(",", ".");

      return Number(precoNormalizado);
    },

    converterPrecoParaCampo(valor) {
      if (valor === null || valor === undefined) {
        return "";
      }

      return Number(valor).toFixed(2).replace(".", ",");
    },

    formatarMoeda(valor) {
      return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },

    corEstoque(quantidade) {
      const estoque = Number(quantidade);

      if (estoque === 0) {
        return "error";
      }

      if (estoque <= 5) {
        return "warning";
      }

      return "success";
    },

    textoStatusEstoque(quantidade) {
      const estoque = Number(quantidade);

      if (estoque === 0) {
        return "Esgotado";
      }

      if (estoque <= 5) {
        return "Estoque baixo";
      }

      return "Disponível";
    },

    obterMensagemErro(erro, mensagemPadrao) {
      const dados = erro?.response?.data;

      if (typeof dados === "string" && dados.trim()) {
        return dados;
      }

      if (dados?.mensagem) {
        return dados.mensagem;
      }

      if (dados?.message) {
        return dados.message;
      }

      if (dados?.detail) {
        return dados.detail;
      }

      if (dados?.erro) {
        return dados.erro;
      }

      if (dados?.errors && Array.isArray(dados.errors)) {
        return dados.errors
            .map((item) => item.mensagem || item.message || item)
            .join(" ");
      }

      return mensagemPadrao;
    },

    exibirMensagem(mensagem, cor = "success") {
      this.snackbar.mensagem = mensagem;
      this.snackbar.cor = cor;
      this.snackbar.aberto = true;
    },
  },
};
</script>