// components/treasurer/useDeleteModal.js
import { useState, useCallback } from "react";

const useDeleteModal = () => {
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    title: "",
    message: "",
    itemName: "",
    itemType: "item",
    onConfirm: null,
    variant: "danger",
    isDeleting: false,
  });

  const showDeleteModal = useCallback(
    ({
      title = "Delete Item",
      message = "Are you sure you want to delete this item? This action cannot be undone.",
      itemName = "",
      itemType = "item",
      onConfirm = null,
      variant = "danger",
    }) => {
      setDeleteState({
        isOpen: true,
        title,
        message,
        itemName,
        itemType,
        onConfirm,
        variant,
        isDeleting: false,
      });
    },
    [],
  );

  const closeDeleteModal = useCallback(() => {
    setDeleteState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setDeleting = useCallback((isDeleting) => {
    setDeleteState((prev) => ({ ...prev, isDeleting }));
  }, []);

  return {
    deleteState,
    showDeleteModal,
    closeDeleteModal,
    setDeleting,
  };
};

export default useDeleteModal;
