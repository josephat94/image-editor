import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle2, CloudUpload } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditorToolbar } from "@/components/EditorToolbar";
import { useUIStore } from "@/stores/uiStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsLaptop } from "@/hooks/use-is-laptop";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  onRestartTour: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBackground: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onRestartTour,
  onFileUpload,
  onRemoveBackground,
}) => {
  const isHistoryPanelOpen = useUIStore((state) => state.isHistoryPanelOpen);
  const { lastSaved, isAutoSaving } = useUIStore();
  const isMobile = useIsMobile();
  const isLaptop = useIsLaptop();

  const [timeAgo, setTimeAgo] = useState<string>("");

  // Actualizar el tiempo transcurrido cada minuto
  useEffect(() => {
    if (!lastSaved) return;

    const updateTime = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

      if (diff < 60) {
        setTimeAgo("hace unos segundos");
      } else {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`hace ${minutes} min`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  return (
    <header
      id="editor-header"
      className={cn(
        "flex shrink-0 items-center border-b border-gray-700 bg-gray-800 transition-all duration-300",
        // Height: mobile h-14, laptop h-[60px], desktop h-16
        isMobile ? "h-14" : isLaptop ? "h-[60px]" : "h-16",
        // Gap: mobile gap-2, laptop gap-3, desktop gap-4
        isMobile ? "gap-2" : isLaptop ? "gap-3" : "gap-4",
        // Padding horizontal: mobile px-3, laptop px-5, desktop px-6
        isMobile ? "px-3" : isLaptop ? "px-5" : "px-6",
        !isMobile && isHistoryPanelOpen
          ? "pr-[22rem]"
          : isMobile
          ? "pr-3"
          : isLaptop
          ? "pr-5"
          : "pr-6"
      )}
    >
      <SidebarTrigger className="text-white h-10 w-10 md:h-10 md:w-10 shrink-0" />
      {!isMobile && (
        <Separator
          orientation="vertical"
          className="h-6 bg-gray-600 shrink-0"
        />
      )}
      <h1
        className={cn(
          "font-bold text-white flex items-center gap-2 shrink-0",
          isMobile ? "text-lg" : "text-xl"
        )}
      >
        <img
          src="/favicon.png"
          alt="Watermark"
          className={isLaptop ? "w-[40px]" : "w-[40px]"}
        />
        QS
      </h1>

      {/* Toolbar en la misma fila */}
      {!isMobile && (
        <div className="flex-1 flex justify-center items-center">
          <EditorToolbar
            onFileUpload={onFileUpload}
            onRemoveBackground={onRemoveBackground}
          />
        </div>
      )}

      <div
        className={cn(
          "flex items-center gap-2 shrink-0",
          isMobile && "gap-1",
          !isMobile && "ml-auto"
        )}
      >
        {/* Indicador de Auto-guardado */}
        {!isMobile && (
          <div className="flex items-center gap-1.5 mr-2 text-xs text-gray-400 select-none">
            {isAutoSaving ? (
              <>
                <CloudUpload className="w-3.5 h-3.5 animate-pulse" />
                <span>Guardando...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span>Guardado {timeAgo}</span>
              </>
            ) : null}
          </div>
        )}

        {!isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onRestartTour}
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver tour de bienvenida</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  );
};
