<template>
  <div>
    <!-- Cabeçalho -->
    <div
        class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6"
    >
      <div>
        <h1 class="text-h4 font-weight-bold">
          Clientes
        </h1>

        <p class="text-medium-emphasis mt-2 mb-0">
          Cadastro e gerenciamento de clientes.
        </p>
      </div>

      <v-btn
          color="primary"
          prepend-icon="mdi-account-plus-outline"
          rounded="lg"
          size="large"
          @click="abrirCadastro"
      >
        Novo cliente
      </v-btn>
    </div>

    <!-- Tabela -->
    <v-card rounded="lg" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
                v-model="pesquisa"
                label="Pesquisar cliente"
                placeholder="Digite nome, CPF ou e-mail"
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
          :items="clientesFiltrados"
          :search="pesquisa"
          item-value="id"
          hover
      >
        <!-- CPF formatado -->
        <template v-slot:[`item.cpf`]="{ item }">
          {{ formatarCpf(item.cpf) }}
        </template>

        <!-- Telefone formatado -->
        <template v-slot:[`item.telefone`]="{ item }">
          {{ formatarTelefone(item.telefone) }}
        </template>

        <!-- Gênero -->
        <template v-slot:[`item.genero`]="{ item }">
          {{ obterDescricaoGenero(item.genero) }}
        </template>

        <!-- Ações -->
        <template v-slot:[`item.acoes`]="{ item }">
          <div class="d-flex justify-center align-center ga-1">
            <v-tooltip text="Editar cliente">
              <template #activator="{ props }">
                <v-btn
                    v-bind="props"
                    icon="mdi-pencil-outline"
                    variant="text"
                    color="primary"
                    size="small"
                    @click="editarCliente(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Excluir cliente">
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
            Nenhum cliente encontrado.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de cadastro e edição -->
    <v-dialog
        v-model="dialogCadastro"
        max-width="1000"
        persistent
    >
      <v-card rounded="lg">
        <v-card-title
            class="d-flex align-center justify-space-between pa-6"
        >
          <span class="text-h5 font-weight-bold">
            {{ clienteEmEdicao ? "Editar cliente" : "Novo cliente" }}
          </span>

          <v-btn
              icon="mdi-close"
              variant="text"
              @click="fecharCadastro"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-form ref="formCliente">
            <!-- Nome -->
            <v-row>
              <v-col cols="12">
                <v-text-field
                    v-model="form.nome"
                    label="Nome"
                    variant="outlined"
                    maxlength="120"
                    :rules="[
                    regras.obrigatorio,
                    regras.nome
                  ]"
                />
              </v-col>
            </v-row>

            <!-- CPF, telefone e e-mail -->
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                    :model-value="form.cpf"
                    label="CPF"
                    variant="outlined"
                    inputmode="numeric"
                    maxlength="14"
                    :rules="[
                    regras.obrigatorio,
                    validarCpfCampo
                  ]"
                    @update:model-value="
                    form.cpf = formatarCpf($event)
                  "
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                    :model-value="form.telefone"
                    label="Telefone"
                    variant="outlined"
                    inputmode="numeric"
                    maxlength="15"
                    :rules="[
                    regras.obrigatorio,
                    regras.telefone
                  ]"
                    @update:model-value="
                    form.telefone = formatarTelefone($event)
                  "
                />
              </v-col>

              <v-col cols="12" md="5">
                <v-text-field
                    v-model.trim="form.email"
                    label="E-mail"
                    type="email"
                    variant="outlined"
                    maxlength="150"
                    :rules="[
                    regras.obrigatorio,
                    regras.email
                  ]"
                    @blur="
                    form.email = normalizarEmail(form.email)
                  "
                />
              </v-col>
            </v-row>

            <!-- Gênero -->
            <v-row>
              <v-col cols="12" md="5">
                <v-select
                    v-model="form.genero"
                    :items="generos"
                    item-title="descricao"
                    item-value="valor"
                    label="Gênero"
                    variant="outlined"
                    prepend-inner-icon="mdi-gender-male-female"
                    :rules="[regras.obrigatorio]"
                />
              </v-col>
            </v-row>

            <div class="d-flex align-center ga-2 mt-2 mb-4">
              <v-icon color="primary">
                mdi-map-marker-outline
              </v-icon>

              <span class="text-h6 font-weight-bold">
                Endereço
              </span>
            </div>

            <!-- CEP, rua e número -->
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                    :model-value="form.endereco.cep"
                    label="CEP"
                    variant="outlined"
                    inputmode="numeric"
                    maxlength="9"
                    prepend-inner-icon="mdi-map-marker"
                    :rules="[
                    regras.obrigatorio,
                    regras.cep
                  ]"
                    @update:model-value="
                    form.endereco.cep = formatarCep($event)
                  "
                />
              </v-col>

              <v-col cols="12" md="7">
                <v-text-field
                    v-model.trim="form.endereco.rua"
                    label="Rua"
                    variant="outlined"
                    maxlength="150"
                    :rules="[regras.obrigatorio]"
                />
              </v-col>

              <v-col cols="12" md="2">
                <v-text-field
                    v-model.trim="form.endereco.numero"
                    label="Número"
                    variant="outlined"
                    maxlength="20"
                    :rules="[regras.obrigatorio]"
                />
              </v-col>
            </v-row>

            <!-- Bairro, cidade e estado -->
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                    v-model.trim="form.endereco.bairro"
                    label="Bairro"
                    variant="outlined"
                    maxlength="100"
                    :rules="[regras.obrigatorio]"
                />
              </v-col>

              <v-col cols="12" md="5">
                <v-text-field
                    v-model.trim="form.endereco.cidade"
                    label="Cidade"
                    variant="outlined"
                    maxlength="100"
                    :rules="[regras.obrigatorio]"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                    :model-value="form.endereco.estado"
                    label="Estado"
                    placeholder="MG"
                    variant="outlined"
                    maxlength="2"
                    :rules="[
                    regras.obrigatorio,
                    regras.estado
                  ]"
                    @update:model-value="
                    form.endereco.estado =
                      normalizarEstado($event)
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
              :loading="salvando"
              :disabled="salvando"
              @click="salvarCliente"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmação de exclusão -->
    <v-dialog
        v-model="dialogExclusao"
        max-width="430"
    >
      <v-card rounded="lg">
        <v-card-title class="text-h5 font-weight-bold pa-6">
          Excluir cliente
        </v-card-title>

        <v-card-text class="px-6">
          Deseja realmente excluir
          <strong>{{ clienteSelecionado?.nome }}</strong>?
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
              @click="excluirCliente"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de erro -->
    <v-dialog
        v-model="dialogErro.aberto"
        max-width="500"
    >
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-3 pa-6">
          <v-icon color="error" size="32">
            mdi-alert-circle-outline
          </v-icon>

          <span class="text-h5 font-weight-bold">
        Não foi possível concluir a operação
      </span>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6 text-body-1">
          {{ dialogErro.mensagem }}
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-6">
          <v-spacer />

          <v-btn
              color="error"
              variant="text"
              @click="fecharDialogErro"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Mensagem de sucesso ou erro -->
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
import clienteService from "@/services/clienteService";

export default {
  name: "ClienteListView",

  data() {
    return {
      pesquisa: "",
      dialogCadastro: false,
      dialogExclusao: false,

      dialogErro: {
        aberto: false,
        mensagem: "",
      },

      clienteEmEdicao: false,
      clienteSelecionado: null,
      carregando: false,
      salvando: false,

      snackbar: {
        aberto: false,
        mensagem: "",
        cor: "success",
      },

      generos: [
        {
          descricao: "Feminino",
          valor: "FEMININO",
        },
        {
          descricao: "Masculino",
          valor: "MASCULINO",
        },
        {
          descricao: "Outro",
          valor: "OUTRO",
        },
        {
          descricao: "Prefiro não informar",
          valor: "NAO_INFORMADO",
        },
      ],

      headers: [
        {
          title: "Nome",
          key: "nome",
        },
        {
          title: "CPF",
          key: "cpf",
        },
        {
          title: "Telefone",
          key: "telefone",
        },
        {
          title: "E-mail",
          key: "email",
        },
        {
          title: "Gênero",
          key: "genero",
        },
        {
          title: "Ações",
          key: "acoes",
          sortable: false,
          align: "center",
          width: 140,
        },
      ],

      clientes: [],

      form: {
        id: null,
        nome: "",
        cpf: "",
        telefone: "",
        email: "",
        genero: "",
        endereco: {
          cep: "",
          rua: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
        },
      },

      regras: {
        obrigatorio: (valor) =>
            Boolean(String(valor || "").trim()) ||
            "Campo obrigatório",

        nome: (valor) => {
          const nome = String(valor || "").trim();

          if (nome.length < 3) {
            return "Nome deve possuir pelo menos 3 caracteres";
          }

          if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(nome)) {
            return "Nome deve possuir apenas letras";
          }

          return true;
        },

        telefone: (valor) => {
          const numeros = String(valor || "")
              .replace(/\D/g, "");

          return (
              numeros.length === 11 ||
              "Telefone deve possuir DDD e 9 números"
          );
        },

        email: (valor) => {
          const email = String(valor || "").trim();

          return (
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
              "Informe um e-mail válido"
          );
        },

        cep: (valor) => {
          const numeros = String(valor || "")
              .replace(/\D/g, "");

          return (
              numeros.length === 8 ||
              "CEP deve possuir 8 números"
          );
        },

        estado: (valor) => {
          const estado = String(valor || "").trim();

          return (
              /^[A-Za-z]{2}$/.test(estado) ||
              "Estado deve possuir 2 letras"
          );
        },
      },
    };
  },

  mounted() {
    this.carregarClientes();
  },

  computed: {
    clientesFiltrados() {
      return this.clientes;
    },
  },

  methods: {
    abrirCadastro() {
      this.clienteEmEdicao = false;
      this.limparFormulario();
      this.dialogCadastro = true;
    },

    editarCliente(cliente) {
      this.clienteEmEdicao = true;

      this.form = {
        id: cliente.id,
        nome: cliente.nome || "",
        cpf: this.formatarCpf(cliente.cpf),
        telefone: this.formatarTelefone(cliente.telefone),
        email: cliente.email || "",
        genero: cliente.genero || "",
        endereco: {
          cep: this.formatarCep(cliente.endereco?.cep),
          rua: cliente.endereco?.rua || "",
          numero: cliente.endereco?.numero || "",
          bairro: cliente.endereco?.bairro || "",
          cidade: cliente.endereco?.cidade || "",
          estado: cliente.endereco?.estado || "",
        },
      };

      this.dialogCadastro = true;
    },

    fecharCadastro() {
      this.dialogCadastro = false;
      this.clienteEmEdicao = false;
      this.limparFormulario();

      if (this.$refs.formCliente) {
        this.$refs.formCliente.resetValidation();
      }
    },

    async salvarCliente() {
      const resultado = await this.$refs.formCliente.validate();

      if (!resultado.valid) {
        this.exibirMensagem(
            "Corrija os campos destacados antes de salvar.",
            "error"
        );
        return;
      }

      const clienteRequest = {
        nome: String(this.form.nome).trim(),
        cpf: this.removerMascara(this.form.cpf),
        telefone: this.removerMascara(this.form.telefone),
        email: this.normalizarEmail(this.form.email),
        genero: this.form.genero,
        endereco: {
          cep: this.removerMascara(this.form.endereco.cep),
          rua: String(this.form.endereco.rua).trim(),
          numero: String(this.form.endereco.numero).trim(),
          bairro: String(this.form.endereco.bairro).trim(),
          cidade: String(this.form.endereco.cidade).trim(),
          estado: this.normalizarEstado(
              this.form.endereco.estado
          ),
        },
      };

      this.salvando = true;

      try {
        if (this.clienteEmEdicao) {
          await clienteService.atualizar(
              this.form.id,
              clienteRequest
          );

          this.exibirMensagem(
              "Cliente atualizado com sucesso.",
              "success"
          );
        } else {
          await clienteService.salvar(clienteRequest);

          this.exibirMensagem(
              "Cliente cadastrado com sucesso.",
              "success"
          );
        }

        this.fecharCadastro();
        await this.carregarClientes();
      } catch (erro) {
        this.exibirErro(
            erro,
            this.clienteEmEdicao
                ? "Não foi possível atualizar o cliente."
                : "Não foi possível cadastrar o cliente."
        );
      } finally {
        this.salvando = false;
      }
    },

    confirmarExclusao(cliente) {
      this.clienteSelecionado = cliente;
      this.dialogExclusao = true;
    },

    fecharExclusao() {
      this.dialogExclusao = false;
      this.clienteSelecionado = null;
    },

    async excluirCliente() {
      if (!this.clienteSelecionado?.id) {
        return;
      }

      try {
        await clienteService.excluir(
            this.clienteSelecionado.id
        );

        this.fecharExclusao();

        this.exibirMensagem(
            "Cliente excluído com sucesso.",
            "success"
        );

        await this.carregarClientes();
      } catch (erro) {
        this.fecharExclusao();

        this.exibirErro(
            erro,
            "Não foi possível excluir o cliente."
        );
      }
    },

    limparFormulario() {
      this.form = {
        id: null,
        nome: "",
        cpf: "",
        telefone: "",
        email: "",
        genero: "",
        endereco: {
          cep: "",
          rua: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
        },
      };
    },

    validarCpfCampo(valor) {
      const numeros = this.removerMascara(valor);

      if (numeros.length !== 11) {
        return "CPF deve possuir 11 números";
      }

      return (
          this.cpfValido(numeros) ||
          "Informe um CPF válido"
      );
    },

    cpfValido(valor) {
      const cpf = this.removerMascara(valor);

      if (cpf.length !== 11) {
        return false;
      }

      if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
      }

      let soma = 0;

      for (let indice = 0; indice < 9; indice += 1) {
        soma += Number(cpf[indice]) * (10 - indice);
      }

      let primeiroDigito = (soma * 10) % 11;

      if (primeiroDigito === 10) {
        primeiroDigito = 0;
      }

      if (primeiroDigito !== Number(cpf[9])) {
        return false;
      }

      soma = 0;

      for (let indice = 0; indice < 10; indice += 1) {
        soma += Number(cpf[indice]) * (11 - indice);
      }

      let segundoDigito = (soma * 10) % 11;

      if (segundoDigito === 10) {
        segundoDigito = 0;
      }

      return segundoDigito === Number(cpf[10]);
    },

    cpfJaCadastrado(cpf) {
      const cpfLimpo = this.removerMascara(cpf);

      return this.clientes.some((cliente) => {
        const cpfCliente = this.removerMascara(
            cliente.cpf
        );

        return (
            cpfCliente === cpfLimpo &&
            cliente.id !== this.form.id
        );
      });
    },

    emailJaCadastrado(email) {
      const emailNormalizado =
          this.normalizarEmail(email);

      return this.clientes.some((cliente) => {
        return (
            this.normalizarEmail(cliente.email) ===
            emailNormalizado &&
            cliente.id !== this.form.id
        );
      });
    },

    formatarCpf(valor) {
      const numeros = this.removerMascara(valor)
          .slice(0, 11);

      return numeros
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    },

    formatarTelefone(valor) {
      const numeros = this.removerMascara(valor)
          .slice(0, 11);

      if (numeros.length <= 10) {
        return numeros
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
      }

      return numeros
          .replace(/(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{5})(\d)/, "$1-$2");
    },

    formatarCep(valor) {
      const numeros = this.removerMascara(valor)
          .slice(0, 8);

      return numeros.replace(
          /(\d{5})(\d)/,
          "$1-$2"
      );
    },

    removerMascara(valor) {
      return String(valor || "").replace(/\D/g, "");
    },

    normalizarEmail(valor) {
      return String(valor || "")
          .trim()
          .toLowerCase();
    },

    normalizarEstado(valor) {
      return String(valor || "")
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 2)
          .toUpperCase();
    },

    obterDescricaoGenero(valor) {
      const genero = this.generos.find(
          (item) => item.valor === valor
      );

      return genero?.descricao || "Não informado";
    },

    exibirMensagem(mensagem, cor = "success") {
      this.snackbar.mensagem = mensagem;
      this.snackbar.cor = cor;
      this.snackbar.aberto = true;
    },
    async carregarClientes() {
      this.carregando = true;

      try {
        const resposta = await clienteService.listar();
        this.clientes = resposta.data;
      } catch (erro) {
        this.exibirErro(
            erro,
            "Não foi possível carregar os clientes."
        );
      } finally {
        this.carregando = false;
      }
    },
    obterMensagemErro(erro, mensagemPadrao) {
      const dados = erro?.response?.data;

      if (typeof dados === "string" && dados.trim()) {
        return dados;
      }

      if (dados?.message) {
        return dados.message;
      }

      if (dados?.mensagem) {
        return dados.mensagem;
      }

      if (dados?.detail) {
        return dados.detail;
      }

      if (dados?.erro) {
        return dados.erro;
      }

      if (dados?.error) {
        return dados.error;
      }

      if (Array.isArray(dados?.errors) && dados.errors.length > 0) {
        return dados.errors
            .map((item) => item.defaultMessage || item.message || item)
            .join("\n");
      }

      if (dados?.campos && typeof dados.campos === "object") {
        return Object.values(dados.campos).join("\n");
      }

      if (erro?.code === "ERR_NETWORK") {
        return "Não foi possível conectar ao servidor. Verifique se o backend está em execução.";
      }

      if (erro?.response?.status === 401) {
        return "Você não possui autorização para realizar esta operação.";
      }

      if (erro?.response?.status === 403) {
        return "Você não possui permissão para realizar esta operação.";
      }

      if (erro?.response?.status === 404) {
        return "O registro solicitado não foi encontrado.";
      }

      if (erro?.response?.status === 500) {
        return "Ocorreu um erro interno no servidor.";
      }

      return mensagemPadrao || "Ocorreu um erro inesperado.";
    },
    exibirErro(erro, mensagemPadrao) {
      this.dialogErro.mensagem = this.obterMensagemErro(
          erro,
          mensagemPadrao
      );

      this.dialogErro.aberto = true;
    },

    fecharDialogErro() {
      this.dialogErro.aberto = false;
      this.dialogErro.mensagem = "";
    },
  },
};
</script>