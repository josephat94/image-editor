import { useState } from "react";
import type { CallBackProps, Step } from "react-joyride";

const TOUR_COMPLETED_KEY = "quicksnap-tour-completed";

export const useTour = () => {
  const [run, setRun] = useState(false);

  const startTour = (_steps: Step[]) => {
    setRun(true);
  };

  const stopTour = () => {
    setRun(false);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    // Solo manejar estados de finalización - dejar que Joyride maneje el progreso automáticamente
    if (status === "finished" || status === "skipped") {
      // Marcar el tour como completado
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
      stopTour();
    }
  };

  const hasCompletedTour = () => {
    return localStorage.getItem(TOUR_COMPLETED_KEY) === "true";
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    stopTour();
  };

  return {
    run,
    startTour,
    stopTour,
    handleJoyrideCallback,
    hasCompletedTour,
    resetTour,
  };
};
