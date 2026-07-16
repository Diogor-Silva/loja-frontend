import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import HomeView from "@/views/home/HomeView.vue";
import ClienteView from "@/views/clientes/ClienteListView.vue";
import ProdutoView from "@/views/produtos/ProdutoListView.vue";
import CaixaView from "@/views/caixa/CaixaView.vue";
import UsuarioView from "@/views/configuracoes/UsuarioView.vue";
import PerfilView from "@/views/configuracoes/PerfilView.vue";

const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomeView,
        meta: {
          title: "Início",
        },
      },
      {
        path: "clientes",
        name: "clientes",
        component: ClienteView,
        meta: {
          title: "Clientes",
        },
      },
      {
        path: "produtos",
        name: "produtos",
        component: ProdutoView,
        meta: {
          title: "Produtos",
        },
      },
      {
        path: "caixa",
        name: "caixa",
        component: CaixaView,
        meta: {
          title: "Caixa",
        },
      },
      {
        path: "usuarios",
        name: "usuarios",
        component: UsuarioView,
        meta: {
          title: "Usuários",
        },
      },
      {
        path: "perfis",
        name: "perfis",
        component: PerfilView,
        meta: {
          title: "Perfis",
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;