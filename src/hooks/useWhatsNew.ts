import { useState, useEffect } from "react";

const WHATS_NEW_VERSION = "v1"; // Incrementar cuando haya nuevas features
const WHATS_NEW_KEY = `quicksnap-whatsnew-${WHATS_NEW_VERSION}`;

export const useWhatsNew = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Verificar si ya se mostró este modal
    const hasSeenWhatsNew = localStorage.getItem(WHATS_NEW_KEY) === "true";

    // Si no lo ha visto, mostrar después de un pequeño delay
    if (!hasSeenWhatsNew) {
      // Esperar a que la página cargue completamente
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000); // 1 segundo después de cargar

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowModal(false);
    // Marcar como visto
    localStorage.setItem(WHATS_NEW_KEY, "true");
  };

  const resetWhatsNew = () => {
    localStorage.removeItem(WHATS_NEW_KEY);
    setShowModal(true);
  };

  return {
    showModal,
    setShowModal,
    handleClose,
    resetWhatsNew,
  };
};
