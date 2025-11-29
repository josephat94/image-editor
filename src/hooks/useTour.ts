import { useEffect, useRef, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { Driver } from "driver.js";
import type { TourStep } from "@/constants/tourSteps";

const TOUR_COMPLETED_KEY = "quicksnap-tour-completed";

export const useTour = () => {
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    // Inicializar Driver.js
    driverRef.current = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      allowClose: true,
      overlayOpacity: 0.7,
      smoothScroll: true,
      stagePadding: 10,
      stageRadius: 8,
      popoverOffset: 10,
      allowKeyboardControl: true,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "¡Empezar! 🚀",
      onDestroyStarted: () => {
        // Marcar el tour como completado cuando se cierra
        localStorage.setItem(TOUR_COMPLETED_KEY, "true");
      },

      onDestroyed: () => {
        // Limpiar cuando se destruye
        localStorage.setItem(TOUR_COMPLETED_KEY, "true");
      },
      onCloseClick: (_element, _step, opts) => {
        // Manejar clic en el botón de cerrar
        console.log("Close button clicked");
        opts.driver.destroy();
      },
      onNextClick: (_element, _step, opts) => {
        // Si es el último paso, cerrar el tour
        if (opts.driver.isLastStep()) {
          console.log("Last step - closing tour");
          opts.driver.destroy();
        } else {
          // Si no es el último paso, avanzar al siguiente
          opts.driver.moveNext();
        }
      },
      onHighlightStarted: (element, _step) => {
        console.log("Tour highlighting element:", element);
        // Verificar que el elemento existe
        if (!element) {
          console.warn("Tour element not found during highlight");
        }
      },
      onHighlighted: (_element, _step) => {
        // Asegurar que los botones funcionen correctamente en todos los pasos
        // Driver.js maneja esto automáticamente, pero verificamos que estén presentes
        setTimeout(() => {
          const doneButton = document.querySelector(".driver-popover-next-btn");
          const closeButton = document.querySelector(
            ".driver-popover-close-btn"
          );

          if (doneButton && driverRef.current?.isLastStep()) {
            // En el último paso, el botón debería decir "Done" o nuestro texto personalizado
            if (doneButton.textContent?.trim() !== "¡Empezar! 🚀") {
              doneButton.textContent = "¡Empezar! 🚀";
            }

            // El callback onNextClick manejará el cierre del tour
          }

          // Verificar que los botones sean clickeables
          if (doneButton && doneButton instanceof HTMLElement) {
            const style = window.getComputedStyle(doneButton);
            if (style.pointerEvents === "none") {
              doneButton.style.pointerEvents = "auto";
            }
          }

          if (closeButton && closeButton instanceof HTMLElement) {
            const style = window.getComputedStyle(closeButton);
            if (style.pointerEvents === "none") {
              closeButton.style.pointerEvents = "auto";
            }
          }
        }, 50);
      },
    });

    // Listener de emergencia para cerrar con ESC
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && driverRef.current) {
        const overlay = document.querySelector(".driver-overlay");
        if (overlay) {
          driverRef.current.destroy();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      // Limpiar al desmontar
      window.removeEventListener("keydown", handleEscape);
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  const startTour = useCallback((steps: TourStep[]) => {
    if (!driverRef.current) {
      console.warn("Driver.js not initialized");
      return;
    }

    // Primero, destruir cualquier tour activo
    driverRef.current.destroy();

    // Filtrar pasos que tienen elementos y verificar que existan y sean visibles en el DOM
    const validSteps = steps.filter((step) => {
      if (!step.element) return true; // Permitir pasos sin elemento (popover centrado)

      const element = document.querySelector(step.element);
      if (!element) {
        console.warn(`Tour step element not found: ${step.element}`);
        return false;
      }

      // Verificar que el elemento sea visible
      const rect = element.getBoundingClientRect();
      const isVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        window.getComputedStyle(element).display !== "none" &&
        window.getComputedStyle(element).visibility !== "hidden";

      if (!isVisible) {
        console.warn(`Tour step element not visible: ${step.element}`);
        return false;
      }

      return true;
    });

    if (validSteps.length === 0) {
      console.warn("No valid tour steps found");
      return;
    }

    console.log(
      `Starting tour with ${validSteps.length} valid steps`,
      validSteps
    );

    try {
      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        if (!driverRef.current) return;

        // Usar setSteps() para establecer los pasos y luego drive() sin argumentos
        driverRef.current.setSteps(validSteps as any);
        driverRef.current.drive();

        // Verificar que el tour se inició correctamente
        setTimeout(() => {
          const overlay = document.querySelector(".driver-overlay");
          const popover = document.querySelector(".driver-popover");

          if (!overlay) {
            console.warn("Tour overlay not found after starting");
            return;
          }

          if (!popover) {
            console.warn("Tour popover not found, tour may be stuck");
            // Intentar cerrar y reiniciar
            driverRef.current?.destroy();
          } else {
            console.log("Tour started successfully");
          }
        }, 500);
      }, 100);
    } catch (error) {
      console.error("Error starting tour:", error);
      // Asegurarse de destruir el tour si hay un error
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    }
  }, []);

  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }
  }, []);

  const hasCompletedTour = useCallback(() => {
    return localStorage.getItem(TOUR_COMPLETED_KEY) === "true";
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    if (driverRef.current) {
      driverRef.current.destroy();
    }
  }, []);

  // Función de emergencia para forzar el cierre del tour
  const forceClose = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }
    // También remover cualquier overlay que pueda quedar
    const overlay = document.querySelector(".driver-overlay");
    if (overlay) {
      overlay.remove();
    }
    const popover = document.querySelector(".driver-popover");
    if (popover) {
      popover.remove();
    }
  }, []);

  // Exponer función de emergencia globalmente para debugging
  useEffect(() => {
    (window as any).__forceCloseTour = forceClose;
    return () => {
      delete (window as any).__forceCloseTour;
    };
  }, [forceClose]);

  return {
    startTour,
    stopTour,
    hasCompletedTour,
    resetTour,
    forceClose,
  };
};
