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
            <v-avatar color="primary" variant="tonal" size="52">
              <v-icon color="primary" size="28">
                {{ card.icon }}
              </v-icon>
            </v-avatar>

            <div class="ml-4">
              <div class="text-body-2 text-medium-emphasis">
                {{ card.title }}
              </div>

              <div class="text-h5 font-weight-bold">
                {{ card.value }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "HomeView",

  data() {
    return {
      cards: [
        {
          title: "Clientes",
          value: "0",
          icon: "mdi-account-group-outline",
        },
        {
          title: "Produtos",
          value: "0",
          icon: "mdi-package-variant-closed",
        },
        {
          title: "Vendas hoje",
          value: "0",
          icon: "mdi-cart-outline",
        },
        {
          title: "Total do dia",
          value: "R$ 0,00",
          icon: "mdi-cash",
        },
      ],
    };
  },
};
</script>