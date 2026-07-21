<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">
        Caixa
      </h1>

      <p class="text-medium-emphasis mt-2 mb-0">
        Registre os produtos e finalize a venda.
      </p>
    </div>

    <v-row>
      <!-- Parte esquerda: cliente e produtos -->
      <v-col cols="12" lg="8">
        <v-card rounded="lg" elevation="1" class="mb-6">
          <v-card-title class="pa-5">
            Cliente
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-5">
            <v-autocomplete
                v-model="clienteSelecionado"
                :items="clientes"
                item-title="nome"
                item-value="id"
                label="Selecione o cliente"
                placeholder="Pesquise pelo nome ou CPF"
                prepend-inner-icon="mdi-account-search-outline"
                variant="outlined"
                clearable
                return-object
                hide-details
            />
          </v-card-text>
        </v-card>

        <v-card rounded="lg" elevation="1">
          <v-card-title class="pa-5">
            Adicionar produto
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-5">
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-autocomplete
                    v-model="produtoSelecionado"
                    :items="produtosDisponiveis"
                    item-title="nome"
                    item-value="id"
                    label="Produto"
                    placeholder="Pesquise pelo nome ou código de barras"
                    prepend-inner-icon="mdi-package-variant"
                    variant="outlined"
                    return-object
                    clearable
                    hide-details
                >
                  <template #item="{ props, item }">
                    <v-list-item
                        v-bind="props"
                        :subtitle="
            `${formatarMoeda(item.raw.preco)} • Estoque: ${item.raw.quantidadeEstoque}`
          "
                    />
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-text-field
                    v-model.number="quantidade"
                    label="Quantidade"
                    type="number"
                    min="1"
                    variant="outlined"
                    hide-details
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-btn
                    color="primary"
                    block
                    height="56"
                    prepend-icon="mdi-plus"
                    class="botao-adicionar"
                    @click="adicionarProduto"
                >
                  Adicionar
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider />

          <v-data-table
              :headers="headersItens"
              :items="itensVenda"
              item-value="produtoId"
              hide-default-footer
          >
            <template v-slot:[`item.valorUnitario`]="{ item }">
              {{ formatarMoeda(item.valorUnitario) }}
            </template>

            <template v-slot:[`item.subtotal`]="{ item }">
              {{ formatarMoeda(item.subtotal) }}
            </template>

            <template v-slot:[`item.acoes`]="{ item }">
              <div class="d-flex justify-center">
                <v-btn
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    size="small"
                    @click="removerProduto(item.produtoId)"
                />
              </div>
            </template>

            <template #no-data>
              <div class="pa-8 text-center text-medium-emphasis">
                Nenhum produto adicionado à venda.
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Parte direita: resumo -->
      <v-col cols="12" lg="4">
        <v-card rounded="lg" elevation="1" class="resumo-card">
          <v-card-title class="pa-5">
            Resumo da venda
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between mb-4">
              <span class="text-medium-emphasis">
                Quantidade de itens
              </span>

              <strong>{{ quantidadeTotalItens }}</strong>
            </div>

            <div class="d-flex justify-space-between mb-5">
              <span class="text-medium-emphasis">
                Total
              </span>

              <strong class="text-h5">
                {{ formatarMoeda(valorTotal) }}
              </strong>
            </div>

            <v-select
                v-model="formaPagamento"
                :items="formasPagamento"
                label="Forma de pagamento"
                variant="outlined"
            />

            <v-text-field
                v-if="formaPagamento === 'DINHEIRO'"
                v-model="valorPago"
                label="Valor pago"
                prefix="R$"
                variant="outlined"
                inputmode="decimal"
                @update:model-value="valorPago = formatarCampoPreco($event)"
            />

            <div
                v-if="formaPagamento === 'DINHEIRO'"
                class="d-flex justify-space-between mb-5"
            >
              <span class="text-medium-emphasis">
                Troco
              </span>

              <strong>
                {{ formatarMoeda(troco) }}
              </strong>
            </div>

            <v-btn
                color="primary"
                size="large"
                block
                prepend-icon="mdi-check-circle-outline"
                :disabled="!podeFinalizar"
                @click="finalizarVenda"
            >
              Finalizar venda
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
        v-model="snackbarAberto"
        :color="snackbarCor"
        location="top right"
        :timeout="3500"
    >
      {{ snackbarMensagem }}

      <template #actions>
        <v-btn
            variant="text"
            @click="snackbarAberto = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "CaixaView",

  data() {
    return {
      clienteSelecionado: null,
      produtoSelecionado: null,
      quantidade: 1,
      formaPagamento: null,
      valorPago: "",

      snackbarAberto: false,
      snackbarMensagem: "",
      snackbarCor: "success",

      formasPagamento: [
        {
          title: "Dinheiro",
          value: "DINHEIRO",
        },
        {
          title: "Cartão de crédito",
          value: "CARTAO_CREDITO",
        },
        {
          title: "Cartão de débito",
          value: "CARTAO_DEBITO",
        },
        {
          title: "Pix",
          value: "PIX",
        },
      ],

      clientes: [
        {
          id: 1,
          nome: "Maria Oliveira",
          cpf: "52998224725",
        },
        {
          id: 2,
          nome: "João da Silva",
          cpf: "11144477735",
        },
      ],

      produtos: [
        {
          id: 1,
          nome: "Memória RAM Kingston Fury 16GB",
          codigoBarra: "7891234567890",
          preco: 279.9,
          quantidadeEstoque: 12,
        },
        {
          id: 2,
          nome: "Mouse Gamer",
          codigoBarra: "7899876543210",
          preco: 149.9,
          quantidadeEstoque: 3,
        },
        {
          id: 3,
          nome: "Teclado Mecânico",
          codigoBarra: "7894561237890",
          preco: 329.9,
          quantidadeEstoque: 0,
        },
      ],

      itensVenda: [],

      headersItens: [
        {
          title: "Produto",
          key: "nome",
        },
        {
          title: "Quantidade",
          key: "quantidade",
          align: "center",
        },
        {
          title: "Valor unitário",
          key: "valorUnitario",
        },
        {
          title: "Subtotal",
          key: "subtotal",
        },
        {
          title: "Ações",
          key: "acoes",
          align: "center",
          sortable: false,
          width: 100,
        },
      ],
    };
  },

  computed: {
    produtosDisponiveis() {
      return this.produtos.filter(
          (produto) => produto.quantidadeEstoque > 0
      );
    },

    quantidadeTotalItens() {
      return this.itensVenda.reduce(
          (total, item) => total + item.quantidade,
          0
      );
    },

    valorTotal() {
      return this.itensVenda.reduce(
          (total, item) => total + item.subtotal,
          0
      );
    },

    troco() {
      if (this.formaPagamento !== "DINHEIRO") {
        return 0;
      }

      const pago = this.converterValor(this.valorPago);
      const diferenca = pago - this.valorTotal;

      return diferenca > 0 ? diferenca : 0;
    },

    podeFinalizar() {
      if (!this.clienteSelecionado) {
        return false;
      }

      if (this.itensVenda.length === 0) {
        return false;
      }

      if (!this.formaPagamento) {
        return false;
      }

      return !(
          this.formaPagamento === "DINHEIRO" &&
          this.converterValor(this.valorPago) < this.valorTotal
      );
    },
  },

  methods: {
    adicionarProduto() {
      if (!this.produtoSelecionado) {
        this.exibirMensagem(
            "Selecione um produto.",
            "error"
        );
        return;
      }

      const quantidade = Number(this.quantidade);

      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        this.exibirMensagem(
            "Informe uma quantidade válida.",
            "error"
        );
        return;
      }

      const itemExistente = this.itensVenda.find(
          (item) =>
              item.produtoId === this.produtoSelecionado.id
      );

      const quantidadeAtual = itemExistente
          ? itemExistente.quantidade
          : 0;

      if (
          quantidadeAtual + quantidade >
          this.produtoSelecionado.quantidadeEstoque
      ) {
        this.exibirMensagem(
            "A quantidade informada é maior que o estoque disponível.",
            "error"
        );
        return;
      }

      if (itemExistente) {
        itemExistente.quantidade += quantidade;
        itemExistente.subtotal =
            itemExistente.quantidade *
            itemExistente.valorUnitario;
      } else {
        this.itensVenda.push({
          produtoId: this.produtoSelecionado.id,
          nome: this.produtoSelecionado.nome,
          quantidade,
          valorUnitario: this.produtoSelecionado.preco,
          subtotal:
              quantidade * this.produtoSelecionado.preco,
        });
      }

      this.produtoSelecionado = null;
      this.quantidade = 1;
    },

    removerProduto(produtoId) {
      this.itensVenda = this.itensVenda.filter(
          (item) => item.produtoId !== produtoId
      );
    },

    finalizarVenda() {
      if (!this.podeFinalizar) {
        this.exibirMensagem(
            "Preencha os dados necessários para finalizar a venda.",
            "error"
        );
        return;
      }

      this.exibirMensagem(
          "Venda finalizada com sucesso.",
          "success"
      );

      this.limparVenda();
    },

    limparVenda() {
      this.clienteSelecionado = null;
      this.produtoSelecionado = null;
      this.quantidade = 1;
      this.formaPagamento = null;
      this.valorPago = "";
      this.itensVenda = [];
    },

    converterValor(valor) {
      const texto = String(valor || "")
          .replace(/\./g, "")
          .replace(",", ".");

      return Number(texto) || 0;
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

    exibirMensagem(mensagem, cor = "success") {
      this.snackbarMensagem = mensagem;
      this.snackbarCor = cor;
      this.snackbarAberto = true;
    },
  },
};
</script>

<style scoped>
.resumo-card {
  position: sticky;
  top: 88px;
}

.botao-adicionar {
  white-space: nowrap;
  min-width: 0;
}
</style>