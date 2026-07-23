import api from "./api";

const produtoService = {
    listar() {
        return api.get("/produtos");
    },

    buscarPorId(id) {
        return api.get(`/produtos/${id}`);
    },

    salvar(produto) {
        return api.post("/produtos", produto);
    },

    atualizar(id, produto) {
        return api.put(`/produtos/${id}`, produto);
    },

    excluir(id) {
        return api.delete(`/produtos/${id}`);
    },
};

export default produtoService;