import { useState } from "react";
import emailjs from "@emailjs/browser";

interface FeedbackData {
  name: string;
  email: string;
  message: string;
  rating?: number;
}

interface UseFeedbackReturn {
  isSubmitting: boolean;
  submitFeedback: (
    data: FeedbackData
  ) => Promise<{ success: boolean; error?: string }>;
}

// Configuración de EmailJS - estas variables deben estar en .env
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

export const useFeedback = (): UseFeedbackReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (
    data: FeedbackData
  ): Promise<{ success: boolean; error?: string }> => {
    // Validar que las credenciales estén configuradas
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      return {
        success: false,
        error:
          "EmailJS no está configurado. Por favor, configura las variables de entorno.",
      };
    }

    setIsSubmitting(true);

    try {
      // Preparar los parámetros del template
      const templateParams = {
        from_name: data.name || "Usuario anónimo",
        from_email: data.email || "sin-email@quicksnap.dev",
        message: data.message,
        rating: data.rating ? `⭐ ${data.rating}/5` : "Sin calificación",
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // Enviar el email usando EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setIsSubmitting(false);
      return { success: true };
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error enviando feedback:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al enviar el feedback",
      };
    }
  };

  return {
    isSubmitting,
    submitFeedback,
  };
};
