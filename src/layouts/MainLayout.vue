<template>
  <v-app>
    <v-navigation-drawer
        v-model="drawer"
        color="#121212"
        theme="dark"
        width="260"
    >
      <div class="logo-area">
        <v-icon color="primary" size="34">
          mdi-store
        </v-icon>

        <div class="ml-3">
          <div class="logo-title">Loja Tech</div>
          <div class="logo-subtitle">Sistema de gestão</div>
        </div>
      </div>

      <v-divider />

      <v-list nav class="px-3">
        <v-list-item
            v-for="item in itensMenu"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            color="primary"
            rounded="lg"
        />
      </v-list>

      <template #append>
        <div v-if="exibirConfiguracoes" class="pa-3">
          <v-divider class="mb-3" />

          <div class="menu-section-title">
            CONFIGURAÇÕES
          </div>

          <v-list nav density="compact">
            <v-list-item
                to="/usuarios"
                prepend-icon="mdi-account-cog"
                title="Usuários"
                color="primary"
                rounded="lg"
            />

            <v-list-item
                to="/perfis"
                prepend-icon="mdi-shield-account"
                title="Perfis"
                color="primary"
                rounded="lg"
            />
          </v-list>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar color="surface" elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-toolbar-title class="font-weight-bold">
        {{ tituloPagina }}
      </v-toolbar-title>

      <v-spacer />

      <v-chip color="primary" variant="tonal" class="mr-4">
        {{ perfilUsuario }}
      </v-chip>

      <v-avatar color="primary" class="mr-4">
        <v-icon color="white">mdi-account</v-icon>
      </v-avatar>
    </v-app-bar>

    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "MainLayout",

  data() {
    return {
      drawer: true,

      // Provisório. Depois será substituído pelo perfil do Keycloak.
      perfilUsuario: "ADMIN",

      itensMenu: [
        {
          title: "Início",
          icon: "mdi-home-outline",
          to: "/",
        },
        {
          title: "Clientes",
          icon: "mdi-account-group-outline",
          to: "/clientes",
        },
        {
          title: "Produtos",
          icon: "mdi-package-variant-closed",
          to: "/produtos",
        },
        {
          title: "Caixa",
          icon: "mdi-cash-register",
          to: "/caixa",
        },
      ],
    };
  },

  computed: {
    exibirConfiguracoes() {
      return this.perfilUsuario === "ADMIN";
    },

    tituloPagina() {
      return this.$route.meta?.title || "Loja Tech";
    },
  },
};
</script>

<style scoped>
.logo-area {
  display: flex;
  align-items: center;
  min-height: 88px;
  padding: 16px 20px;
}

.logo-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.logo-subtitle {
  color: #9e9e9e;
  font-size: 12px;
}

.menu-section-title {
  color: #8a8a8a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 12px 6px;
}

.main-content {
  background-color: #f4f7f6;
  min-height: 100vh;
}
</style>