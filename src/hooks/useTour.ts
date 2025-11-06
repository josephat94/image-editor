import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import type { DriveStep, Config } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_COMPLETED_KEY = "quicksnap-tour-completed";

export const useTour = (
  onStepHighlight?: (
    element: HTMLElement | null,
    step: DriveStep,
    index: number
  ) => void
) => {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    // Configuración del driver
    const driverConfig: Config = {
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "¡Empezar! 🚀",
      progressText: "{{current}} de {{total}}",
      allowClose: true,
      smoothScroll: true,
      stagePadding: 10,
      popoverClass: "driver-popover-custom",
      onHighlightStarted: (_element, step) => {
        // Llamar al callback si está definido
        if (onStepHighlight && step.element) {
          const domElement =
            typeof step.element === "string"
              ? (document.querySelector(step.element) as HTMLElement)
              : (step.element as HTMLElement);
          onStepHighlight(domElement, step, 0);
        }
      },
      onDestroyed: () => {
        setIsTourActive(false);
        // Marcar el tour como completado
        localStorage.setItem(TOUR_COMPLETED_KEY, "true");
      },
    };

    driverRef.current = driver(driverConfig);

    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, [onStepHighlight]);

  const startTour = (steps: DriveStep[]) => {
    if (driverRef.current) {
      setIsTourActive(true);
      driverRef.current.setSteps(steps);
      driverRef.current.drive();
    }
  };

  const hasCompletedTour = () => {
    return localStorage.getItem(TOUR_COMPLETED_KEY) === "true";
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
  };

  return {
    startTour,
    hasCompletedTour,
    resetTour,
    isTourActive,
  };
};
