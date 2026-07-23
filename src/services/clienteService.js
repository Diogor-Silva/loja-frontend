import api from "./api";

const clienteService = {
    listar() {
        return api.get("/clientes");
    },

    buscarPorId(id) {
        return api.get(`/clientes/${id}`);
    },

    salvar(cliente) {
        return api.post("/clientes", cliente);
    },

    atualizar(id, cliente) {
        return api.put(`/clientes/${id}`, cliente);
    },

    excluir(id) {
        return api.delete(`/clientes/${id}`);
    },
};

export default clienteService;