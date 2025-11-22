import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, Layout, Zap, CheckCircle2 } from "lucide-react";

interface WhatsNewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  {
    icon: Save,
    title: "Auto-guardado Inteligente",
    description:
      "Tu trabajo se guarda automáticamente cada 2 segundos. Nunca más perderás tu progreso si cierras el navegador accidentalmente.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Layout,
    title: "Layout Automático",
    description:
      "Al pegar múltiples imágenes, QuickSnap las organiza automáticamente usando espacios disponibles. El canvas crece si es necesario.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "Redimensionamiento Inteligente",
    description:
      "El canvas se ajusta automáticamente al tamaño de tu ventana, respetando paneles laterales. También puedes redimensionarlo manualmente.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
];

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              ¡Nuevas Features! 🎉
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-300 text-base">
            Hemos agregado mejoras importantes para hacer tu experiencia aún
            mejor. Aquí están las novedades:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`flex gap-4 p-4 rounded-lg border border-gray-700 ${feature.bgColor} transition-all hover:border-gray-600`}
              >
                <div
                  className={`flex-shrink-0 p-3 rounded-lg ${feature.bgColor} border border-gray-700`}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                    {feature.title}
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              💡 <strong>Tip:</strong> Puedes ver este mensaje nuevamente desde
              el menú de ayuda
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              ¡Genial, vamos! 🚀
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
