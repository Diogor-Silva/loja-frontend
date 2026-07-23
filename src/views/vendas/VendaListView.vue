<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">
        Vendas
      </h1>

      <p class="text-medium-emphasis mt-2 mb-0">
        Consulte o histórico de vendas realizadas.
      </p>
    </div>

    <v-card rounded="lg" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
                v-model="pesquisa"
                label="Pesquisar venda"
                placeholder="Pesquise pelo cliente, CPF ou pagamento"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
            />
          </v-col>

          <v-col
              cols="12"
              md="6"
              class="d-flex justify-end"
          >
            <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                variant="tonal"
                :loading="carregando"
                @click="carregarVendas"
            >
              Atualizar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-data-table
          :headers="headers"
          :items="vendas"
          :search="pesquisa"
          :loading="carregando"
          loading-text="Carregando vendas..."
          item-value="id"
          hover
      >
        <template v-slot:[`item.id`]="{ item }">
          #{{ item.id }}
        </template>

        <template v-slot:[`item.dataVenda`]="{ item }">
          {{ formatarDataHora(item.dataVenda) }}
        </template>

        <template v-slot:[`item.clienteCpf`]="{ item }">
          {{ formatarCpf(item.clienteCpf) }}
        </template>

        <template v-slot:[`item.formaPagamento`]="{ item }">
          <v-chip
              color="primary"
              variant="tonal"
              size="small"
          >
            {{ formatarFormaPagamento(item.formaPagamento) }}
          </v-chip>
        </template>

        <template v-slot:[`item.valorTotal`]="{ item }">
          <strong>
            {{ formatarMoeda(item.valorTotal) }}
          </strong>
        </template>

        <template v-slot:[`item.acoes`]="{ item }">
          <div class="d-flex justify-center">
            <v-tooltip text="Visualizar detalhes">
              <template #activator="{ props }">
                <v-btn
                    v-bind="props"
                    icon="mdi-eye-outline"
                    variant="text"
                    color="primary"
                    size="small"
                    @click="abrirDetalhes(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #no-data>
          <div class="pa-8 text-center text-medium-emphasis">
            Nenhuma venda encontrada.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
        v-model="dialogDetalhes"
        max-width="900"
    >
      <v-card rounded="lg">
        <v-card-title
            class="d-flex align-center justify-space-between pa-6"
        >
          <div>
            <div class="text-h5 font-weight-bold">
              Detalhes da venda
              <span v-if="vendaSelecionada">
                #{{ vendaSelecionada.id }}
              </span>
            </div>

            <div
                v-if="vendaSelecionada"
                class="text-body-2 text-medium-emphasis mt-1"
            >
              {{ formatarDataHora(vendaSelecionada.dataVenda) }}
            </div>
          </div>

          <v-btn
              icon="mdi-close"
              variant="text"
              @click="fecharDetalhes"
          />
        </v-card-title>

        <v-divider />

        <v-card-text
            v-if="vendaSelecionada"
            class="pa-6"
        >
          <v-row>
            <v-col cols="12" md="6">
              <div class="detalhe-label">
                Cliente
              </div>

              <div class="detalhe-valor">
                {{ vendaSelecionada.clienteNome }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detalhe-label">
                CPF
              </div>

              <div class="detalhe-valor">
                {{ formatarCpf(vendaSelecionada.clienteCpf) }}
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="detalhe-label">
                Forma de pagamento
              </div>

              <div class="detalhe-valor">
                {{
                  formatarFormaPagamento(
                      vendaSelecionada.formaPagamento
                  )
                }}
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="detalhe-label">
                Valor pago
              </div>

              <div class="detalhe-valor">
                {{ formatarMoeda(vendaSelecionada.valorPago) }}
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="detalhe-label">
                Troco
              </div>

              <div class="detalhe-valor">
                {{ formatarMoeda(vendaSelecionada.troco) }}
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="text-h6 font-weight-bold mb-4">
            Produtos vendidos
          </div>

          <v-table>
            <thead>
            <tr>
              <th>Produto</th>
              <th>Código de barras</th>
              <th class="text-center">Quantidade</th>
              <th class="text-end">Valor unitário</th>
              <th class="text-end">Subtotal</th>
            </tr>
            </thead>

            <tbody>
            <tr
                v-for="item in vendaSelecionada.itens"
                :key="item.id"
            >
              <td>{{ item.produtoNome }}</td>

              <td>
                {{ item.codigoBarra || "Não informado" }}
              </td>

              <td class="text-center">
                {{ item.quantidade }}
              </td>

              <td class="text-end">
                {{ formatarMoeda(item.valorUnitario) }}
              </td>

              <td class="text-end">
                {{ formatarMoeda(item.subtotal) }}
              </td>
            </tr>
            </tbody>
          </v-table>

          <v-divider class="my-5" />

          <div class="d-flex justify-end align-center">
            <span class="text-body-1 mr-4">
              Total da venda:
            </span>

            <span class="text-h5 font-weight-bold">
              {{ formatarMoeda(vendaSelecionada.valorTotal) }}
            </span>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-6">
          <v-spacer />

          <v-btn
              color="primary"
              variant="tonal"
              @click="fecharDetalhes"
          >
            Fechar
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
import caixaService from "@/services/caixaService";

export default {
  name: "VendaListView",

  data() {
    return {
      pesquisa: "",
      carregando: false,
      dialogDetalhes: false,
      vendaSelecionada: null,
      vendas: [],

      snackbar: {
        aberto: false,
        mensagem: "",
        cor: "error",
      },

      headers: [
        {
          title: "Venda",
          key: "id",
          width: 90,
        },
        {
          title: "Data",
          key: "dataVenda",
        },
        {
          title: "Cliente",
          key: "clienteNome",
        },
        {
          title: "CPF",
          key: "clienteCpf",
        },
        {
          title: "Pagamento",
          key: "formaPagamento",
          align: "center",
        },
        {
          title: "Itens",
          key: "quantidadeItens",
          align: "center",
        },
        {
          title: "Total",
          key: "valorTotal",
          align: "end",
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

  mounted() {
    this.carregarVendas();
  },

  methods: {
    async carregarVendas() {
      this.carregando = true;

      try {
        const resposta = await caixaService.listar();

        const vendasRecebidas = Array.isArray(resposta.data)
            ? resposta.data
            : [];

        this.vendas = vendasRecebidas.map((venda) =>
            this.normalizarVenda(venda)
        );
      } catch (erro) {
        console.error("Erro ao carregar vendas:", erro);

        this.vendas = [];

        this.exibirMensagem(
            this.obterMensagemErro(
                erro,
                "Não foi possível carregar o histórico de vendas."
            )
        );
      } finally {
        this.carregando = false;
      }
    },

    normalizarVenda(venda) {
      const itens = Array.isArray(venda.itens)
          ? venda.itens.map((item) => ({
            id: item.id,
            produtoId:
                item.produtoId ??
                item.produto?.id ??
                null,
            produtoNome:
                item.produtoNome ??
                item.produto?.nome ??
                "Produto não informado",
            codigoBarra:
                item.codigoBarra ??
                item.produto?.codigoBarra ??
                "",
            quantidade:
                Number(item.quantidade || 0),
            valorUnitario:
                Number(item.valorUnitario || 0),
            subtotal:
                Number(item.subtotal || 0),
          }))
          : [];

      const quantidadeCalculada = itens.reduce(
          (total, item) => total + item.quantidade,
          0
      );

      return {
        id: venda.id,
        dataVenda: venda.dataVenda,

        clienteId:
            venda.clienteId ??
            venda.cliente?.id ??
            null,

        clienteNome:
            venda.clienteNome ??
            venda.cliente?.nome ??
            "Cliente não informado",

        clienteCpf:
            venda.clienteCpf ??
            venda.cliente?.cpf ??
            "",

        formaPagamento: venda.formaPagamento,

        valorTotal: Number(venda.valorTotal || 0),
        valorPago: Number(venda.valorPago || 0),
        troco: Number(venda.troco || 0),

        quantidadeItens:
            venda.quantidadeItens ??
            quantidadeCalculada,

        itens,
      };
    },

    abrirDetalhes(venda) {
      this.vendaSelecionada = venda;
      this.dialogDetalhes = true;
    },

    fecharDetalhes() {
      this.dialogDetalhes = false;
      this.vendaSelecionada = null;
    },

    formatarMoeda(valor) {
      return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },

    formatarDataHora(data) {
      if (!data) {
        return "";
      }

      const dataConvertida = new Date(data);

      if (Number.isNaN(dataConvertida.getTime())) {
        return data;
      }

      return dataConvertida.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });
    },

    formatarCpf(cpf) {
      const numeros = String(cpf || "")
          .replace(/\D/g, "")
          .slice(0, 11);

      if (numeros.length !== 11) {
        return cpf || "Não informado";
      }

      return numeros.replace(
          /(\d{3})(\d{3})(\d{3})(\d{2})/,
          "$1.$2.$3-$4"
      );
    },

    formatarFormaPagamento(formaPagamento) {
      const formas = {
        DINHEIRO: "Dinheiro",
        PIX: "Pix",
        CARTAO_CREDITO: "Cartão de crédito",
        CARTAO_DEBITO: "Cartão de débito",
      };

      return (
          formas[formaPagamento] ||
          String(formaPagamento || "").replaceAll("_", " ")
      );
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

<style scoped>
.detalhe-label {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 13px;
  margin-bottom: 4px;
}

.detalhe-valor {
  font-size: 16px;
  font-weight: 500;
}
</style>