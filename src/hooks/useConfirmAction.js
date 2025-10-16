import { useCallback } from "react";
import Swal from "sweetalert2";

/**
 * Hook customizado para ações que requerem confirmação e feedback
 * 
 * @param {Function} onSuccess - Callback executado após sucesso (ex: recarregar lista)
 * @returns {Object} Funções para confirmar ações
 */
export const useConfirmAction = (onSuccess) => {
  /**
   * Confirma e executa uma ação de exclusão
   * 
   * @param {Object} options - Opções da confirmação
   * @param {Function} options.action - Função async que executa a ação
   * @param {string} options.itemName - Nome do item a ser deletado
   * @param {string} options.itemType - Tipo do item (plano, usuário, etc)
   * @param {string} options.successMessage - Mensagem de sucesso customizada
   * @param {string} options.errorMessage - Mensagem de erro customizada
   */
  const confirmDelete = useCallback(
    async ({
      action,
      itemName,
      itemType = "item",
      successMessage,
      errorMessage,
    }) => {
      const result = await Swal.fire({
        title: "Confirmar exclusão",
        text: `Deseja realmente excluir ${itemType} "${itemName}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
        focusCancel: true,
      });

      if (result.isConfirmed) {
        try {
          await action();
          
          await Swal.fire({
            icon: "success",
            title: "Sucesso!",
            text: successMessage || `${itemType} excluído com sucesso`,
            timer: 2000,
            showConfirmButton: false,
          });

          // Executa callback de sucesso (ex: recarregar lista)
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error("Erro ao executar ação:", error);
          
          Swal.fire({
            icon: "error",
            title: "Erro!",
            text: errorMessage || `Erro ao excluir ${itemType}`,
            confirmButtonText: "OK",
          });
        }
      }
    },
    [onSuccess]
  );

  /**
   * Confirma e executa uma ação customizada
   * 
   * @param {Object} options - Opções da confirmação
   * @param {Function} options.action - Função async que executa a ação
   * @param {string} options.title - Título da confirmação
   * @param {string} options.text - Texto da confirmação
   * @param {string} options.confirmButtonText - Texto do botão de confirmação
   * @param {string} options.successMessage - Mensagem de sucesso
   * @param {string} options.errorMessage - Mensagem de erro
   * @param {string} options.icon - Ícone da confirmação (warning, info, question)
   */
  const confirmAction = useCallback(
    async ({
      action,
      title = "Confirmar ação",
      text = "Deseja realmente executar esta ação?",
      confirmButtonText = "Sim, confirmar",
      successMessage = "Ação executada com sucesso",
      errorMessage = "Erro ao executar ação",
      icon = "question",
    }) => {
      const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
        confirmButtonText,
        cancelButtonText: "Cancelar",
        focusCancel: true,
      });

      if (result.isConfirmed) {
        try {
          await action();
          
          await Swal.fire({
            icon: "success",
            title: "Sucesso!",
            text: successMessage,
            timer: 2000,
            showConfirmButton: false,
          });

          // Executa callback de sucesso
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error("Erro ao executar ação:", error);
          
          Swal.fire({
            icon: "error",
            title: "Erro!",
            text: errorMessage,
            confirmButtonText: "OK",
          });
        }
      }
    },
    [onSuccess]
  );

  /**
   * Mostra mensagem de sucesso e executa callback
   */
  const showSuccess = useCallback(
    async (message = "Operação realizada com sucesso", autoClose = true) => {
      await Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: message,
        timer: autoClose ? 2000 : undefined,
        showConfirmButton: !autoClose,
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    [onSuccess]
  );

  /**
   * Mostra mensagem de erro
   */
  const showError = useCallback((message = "Ocorreu um erro") => {
    Swal.fire({
      icon: "error",
      title: "Erro!",
      text: message,
      confirmButtonText: "OK",
    });
  }, []);

  return {
    confirmDelete,
    confirmAction,
    showSuccess,
    showError,
  };
};

export default useConfirmAction;

