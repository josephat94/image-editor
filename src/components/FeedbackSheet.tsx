import React, { useState } from "react";
import { MessageSquare, Star, Loader2, CheckCircle2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFeedback } from "@/hooks/useFeedback";
import { cn } from "@/lib/utils";

interface FeedbackSheetProps {
  children?: React.ReactNode;
}

export const FeedbackSheet: React.FC<FeedbackSheetProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { isSubmitting, submitFeedback } = useFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setErrorMessage("Por favor, escribe tu mensaje de feedback");
      return;
    }

    setErrorMessage("");
    setSubmitStatus("idle");

    const result = await submitFeedback({
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      message: message.trim(),
      rating: rating || undefined,
    });

    if (result.success) {
      setSubmitStatus("success");
      // Limpiar el formulario
      setName("");
      setEmail("");
      setMessage("");
      setRating(null);
      // Cerrar después de 2 segundos
      setTimeout(() => {
        setOpen(false);
        setSubmitStatus("idle");
      }, 2000);
    } else {
      setSubmitStatus("error");
      setErrorMessage(result.error || "Error al enviar el feedback");
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false);
      // Resetear estado después de cerrar
      setTimeout(() => {
        setSubmitStatus("idle");
        setErrorMessage("");
      }, 300);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-gray-800 border-gray-700"
      >
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Envíanos tu Feedback
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Tu opinión nos ayuda a mejorar QuickSnap. ¿Qué te gustaría que
            agregáramos o mejoráramos?
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Rating */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              ¿Cómo calificarías QuickSnap?
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-colors",
                      (
                        hoveredRating !== null
                          ? hoveredRating >= star
                          : rating !== null && rating >= star
                      )
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-500 fill-gray-500"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name (opcional) */}
          <div>
            <label
              htmlFor="feedback-name"
              className="text-sm font-medium text-gray-300 mb-2 block"
            >
              Nombre (opcional)
            </label>
            <Input
              id="feedback-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Email (opcional) */}
          <div>
            <label
              htmlFor="feedback-email"
              className="text-sm font-medium text-gray-300 mb-2 block"
            >
              Email (opcional)
            </label>
            <Input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo si quieres que te contactemos sobre tu feedback
            </p>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="feedback-message"
              className="text-sm font-medium text-gray-300 mb-2 block"
            >
              Tu mensaje <span className="text-red-400">*</span>
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="¿Qué te gustaría que mejoráramos? ¿Encontraste algún bug? ¿Tienes alguna sugerencia?"
              rows={6}
              required
              className="flex w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          {/* Success message */}
          {submitStatus === "success" && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              ¡Gracias por tu feedback! Lo revisaremos pronto.
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmitting || submitStatus === "success"}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Enviando...
              </>
            ) : submitStatus === "success" ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                ¡Enviado!
              </>
            ) : (
              "Enviar Feedback"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Tu feedback se envía directamente a nuestro email. No almacenamos
            datos personales.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
