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
                    :rules="[regras.obrigatorio]"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                    v-model="form.marca"
                    label="Marca"
                    variant="outlined"
                    maxlength="80"
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
              @click="fecharCadastro"
          >
            Cancelar
          </v-btn>

          <v-btn
              color="primary"
              rounded="lg"
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
              @click="fecharExclusao"
          >
            Cancelar
          </v-btn>

          <v-btn
              color="error"
              rounded="lg"
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
        :timeout="3500"
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
export default {
  name: "ProdutoListView",

  data() {
    return {
      pesquisa: "",
      dialogCadastro: false,
      dialogExclusao: false,
      produtoEmEdicao: false,
      produtoSelecionado: null,

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

      produtos: [
        {
          id: 1,
          nome: "Memória RAM Kingston Fury 16GB",
          descricao: "Memória DDR4 3200MHz",
          categoria: "Memória RAM",
          marca: "Kingston",
          codigoBarra: "7891234567890",
          preco: 279.9,
          quantidadeEstoque: 12,
        },
        {
          id: 2,
          nome: "Mouse Gamer",
          descricao: "Mouse óptico com iluminação RGB",
          categoria: "Periféricos",
          marca: "Logitech",
          codigoBarra: "7899876543210",
          preco: 149.9,
          quantidadeEstoque: 3,
        },
      ],

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
              Number.isInteger(estoque) &&
              estoque >= 0
          ) || "Estoque deve ser zero ou maior";
        },
      },
    };
  },

  methods: {
    abrirCadastro() {
      this.produtoEmEdicao = false;
      this.limparFormulario();
      this.dialogCadastro = true;
    },

    editarProduto(produto) {
      this.produtoEmEdicao = true;

      this.form = {
        id: produto.id,
        nome: produto.nome,
        descricao: produto.descricao,
        categoria: produto.categoria,
        marca: produto.marca,
        codigoBarra: produto.codigoBarra,
        preco: String(produto.preco)
            .replace(".", ","),
        quantidadeEstoque: String(produto.quantidadeEstoque),
      };

      this.dialogCadastro = true;
    },

    fecharCadastro() {
      this.dialogCadastro = false;
      this.produtoEmEdicao = false;
      this.limparFormulario();

      if (this.$refs.formProduto) {
        this.$refs.formProduto.resetValidation();
      }
    },

    async salvarProduto() {
      const resultado =
          await this.$refs.formProduto.validate();

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

      const produto = {
        id: this.form.id,
        nome: this.form.nome.trim(),
        descricao: this.form.descricao.trim(),
        categoria: this.form.categoria.trim(),
        marca: this.form.marca.trim(),
        codigoBarra: this.form.codigoBarra,
        preco: Number(
            String(this.form.preco).replace(",", ".")
        ),
        quantidadeEstoque: Number(
            this.form.quantidadeEstoque
        ),
      };

      if (this.produtoEmEdicao) {
        const indice = this.produtos.findIndex(
            (item) => item.id === produto.id
        );

        if (indice !== -1) {
          this.produtos[indice] = produto;
        }

        this.exibirMensagem(
            "Produto atualizado com sucesso.",
            "success"
        );
      } else {
        this.produtos.push({
          ...produto,
          id: Date.now(),
        });

        this.exibirMensagem(
            "Produto cadastrado com sucesso.",
            "success"
        );
      }

      this.fecharCadastro();
    },

    confirmarExclusao(produto) {
      this.produtoSelecionado = produto;
      this.dialogExclusao = true;
    },

    fecharExclusao() {
      this.dialogExclusao = false;
      this.produtoSelecionado = null;
    },

    excluirProduto() {
      if (!this.produtoSelecionado) {
        return;
      }

      this.produtos = this.produtos.filter(
          (produto) =>
              produto.id !== this.produtoSelecionado.id
      );

      this.fecharExclusao();

      this.exibirMensagem(
          "Produto excluído com sucesso.",
          "success"
      );
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
      const codigo = String(codigoBarra || "").trim();

      if (!codigo) {
        return false;
      }

      return this.produtos.some((produto) => {
        return (
            produto.codigoBarra === codigo &&
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
      return String(valor || "")
          .replace(/[^\d,]/g, "")
          .replace(/(,.*),/g, "$1")
          .slice(0, 12);
    },

    formatarMoeda(valor) {
      return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },

    corEstoque(quantidade) {
      if (quantidade === 0) {
        return "error";
      }

      if (quantidade <= 5) {
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

    exibirMensagem(mensagem, cor = "success") {
      this.snackbar.mensagem = mensagem;
      this.snackbar.cor = cor;
      this.snackbar.aberto = true;
    },
  },
};
</script>