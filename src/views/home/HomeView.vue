<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">
        Bem-vindo ao sistema
      </h1>

      <p class="text-medium-emphasis mt-2">
        Gerencie clientes, produtos e vendas da loja.
      </p>
    </div>

    <v-row>
      <v-col
          v-for="card in cards"
          :key="card.title"
          cols="12"
          sm="6"
          lg="3"
      >
        <v-card rounded="lg" elevation="1">
          <v-card-text class="d-flex align-center">
            <v-avatar
                color="primary"
                variant="tonal"
                size="52"
            >
              <v-icon color="primary" size="28">
                {{ card.icon }}
              </v-icon>
            </v-avatar>

            <div class="ml-4">
              <div class="text-body-2 text-medium-emphasis">
                {{ card.title }}
              </div>

              <div class="text-h5 font-weight-bold">
                <v-progress-circular
                    v-if="carregando"
                    indeterminate
                    color="primary"
                    size="24"
                    width="3"
                />

                <span v-else>
                  {{ card.value }}
                </span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
import caixaService from "@/services/caixaService";

export default {
  name: "HomeView",

  data() {
    return {
      carregando: false,

      resumo: {
        totalClientes: 0,
        totalProdutos: 0,
        vendasHoje: 0,
        totalDia: 0,
      },

      snackbar: {
        aberto: false,
        mensagem: "",
        cor: "error",
      },
    };
  },

  computed: {
    cards() {
      return [
        {
          title: "Clientes",
          value: String(this.resumo.totalClientes),
          icon: "mdi-account-group-outline",
        },
        {
          title: "Produtos",
          value: String(this.resumo.totalProdutos),
          icon: "mdi-package-variant-closed",
        },
        {
          title: "Vendas hoje",
          value: String(this.resumo.vendasHoje),
          icon: "mdi-cart-outline",
        },
        {
          title: "Total do dia",
          value: this.formatarMoeda(this.resumo.totalDia),
          icon: "mdi-cash",
        },
      ];
    },
  },

  mounted() {
    this.carregarResumo();
  },

  methods: {
    async carregarResumo() {
      this.carregando = true;

      try {
        const resposta =
            await caixaService.buscarResumoDashboard();

        this.resumo = {
          totalClientes:
              resposta.data?.totalClientes ?? 0,
          totalProdutos:
              resposta.data?.totalProdutos ?? 0,
          vendasHoje:
              resposta.data?.vendasHoje ?? 0,
          totalDia:
              resposta.data?.totalDia ?? 0,
        };
      } catch (erro) {
        console.error(
            "Erro ao carregar resumo do dashboard:",
            erro
        );

        this.exibirMensagem(
            this.obterMensagemErro(
                erro,
                "Não foi possível carregar os dados da tela inicial."
            )
        );
      } finally {
        this.carregando = false;
      }
    },

    formatarMoeda(valor) {
      return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
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

      return mensagemPadrao;
    },

    exibirMensagem(mensagem) {
      this.snackbar.mensagem = mensagem;
      this.snackbar.cor = "error";
      this.snackbar.aberto = true;
    },
  },
};
</script>