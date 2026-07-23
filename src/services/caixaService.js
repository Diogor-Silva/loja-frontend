import api from "./api";

const caixaService = {
    finalizarVenda(venda) {
        return api.post("/caixas", venda);
    },

    listar() {
        return api.get("/caixas");
    },

    buscarResumoDashboard() {
        return api.get("/caixas/resumo-dashboard");
    },
};

export default caixaService;