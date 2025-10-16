/**
 * Componente de exemplo/documentação para uso do hook useConfirmAction
 * 
 * ESTE ARQUIVO É APENAS PARA REFERÊNCIA - NÃO É USADO DIRETAMENTE
 * Use o hook useConfirmAction em seus componentes
 */

import { useConfirmAction } from "../../hooks/useConfirmAction";

/**
 * EXEMPLO 1: Deletar com atualização automática da lista
 */
const ExemploDelete = () => {
  const loadItems = async () => {
    // Sua lógica de carregar itens
  };

  const { confirmDelete } = useConfirmAction(loadItems);

  const handleDelete = (id, name) => {
    confirmDelete({
      action: () => api.delete(`/items/${id}`),
      itemName: name,
      itemType: "o item",
      successMessage: "Item excluído com sucesso",
      errorMessage: "Erro ao excluir item",
    });
  };

  return <button onClick={() => handleDelete(1, "Item 1")}>Deletar</button>;
};

/**
 * EXEMPLO 2: Ação customizada (ex: ativar/desativar)
 */
const ExemploAcaoCustomizada = () => {
  const loadItems = async () => {
    // Sua lógica de carregar itens
  };

  const { confirmAction } = useConfirmAction(loadItems);

  const handleActivate = (id, name) => {
    confirmAction({
      action: () => api.put(`/items/${id}/activate`),
      title: "Ativar item",
      text: `Deseja ativar o item "${name}"?`,
      confirmButtonText: "Sim, ativar",
      successMessage: "Item ativado com sucesso",
      errorMessage: "Erro ao ativar item",
      icon: "question",
    });
  };

  return <button onClick={() => handleActivate(1, "Item 1")}>Ativar</button>;
};

/**
 * EXEMPLO 3: Apenas mostrar sucesso após ação
 */
const ExemploMostrarSucesso = () => {
  const loadItems = async () => {
    // Sua lógica de carregar itens
  };

  const { showSuccess, showError } = useConfirmAction(loadItems);

  const handleSave = async () => {
    try {
      await api.post("/items", { name: "Novo item" });
      showSuccess("Item criado com sucesso");
    } catch (error) {
      showError("Erro ao criar item");
    }
  };

  return <button onClick={handleSave}>Salvar</button>;
};

/**
 * EXEMPLO 4: Sem callback (apenas confirmação)
 */
const ExemploSemCallback = () => {
  const { confirmDelete } = useConfirmAction(); // Sem passar callback

  const handleDelete = (id, name) => {
    confirmDelete({
      action: async () => {
        await api.delete(`/items/${id}`);
        // Faz algo específico aqui após deletar
        console.log("Item deletado");
      },
      itemName: name,
      itemType: "o item",
    });
  };

  return <button onClick={() => handleDelete(1, "Item 1")}>Deletar</button>;
};

/**
 * FUNÇÕES DISPONÍVEIS NO HOOK:
 * 
 * 1. confirmDelete(options)
 *    - action: Function async que executa a ação
 *    - itemName: Nome do item a ser deletado
 *    - itemType: Tipo do item (opcional, padrão: "item")
 *    - successMessage: Mensagem de sucesso customizada (opcional)
 *    - errorMessage: Mensagem de erro customizada (opcional)
 * 
 * 2. confirmAction(options)
 *    - action: Function async que executa a ação
 *    - title: Título da confirmação (opcional)
 *    - text: Texto da confirmação (opcional)
 *    - confirmButtonText: Texto do botão (opcional)
 *    - successMessage: Mensagem de sucesso (opcional)
 *    - errorMessage: Mensagem de erro (opcional)
 *    - icon: Ícone (warning, info, question) (opcional)
 * 
 * 3. showSuccess(message, autoClose)
 *    - message: Mensagem de sucesso
 *    - autoClose: Se fecha automaticamente (padrão: true)
 * 
 * 4. showError(message)
 *    - message: Mensagem de erro
 */

export {
  ExemploDelete,
  ExemploAcaoCustomizada,
  ExemploMostrarSucesso,
  ExemploSemCallback,
};

