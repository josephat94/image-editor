import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
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
  const isMobile = useIsMobile();
  const isLaptop = useIsLaptop();

  return (
    <header
      id="editor-header"
      className={cn(
        "flex flex-col shrink-0 border-b border-gray-700 bg-gray-800 transition-all duration-300",
        !isMobile && isHistoryPanelOpen
          ? "pr-[22rem]"
          : isMobile
          ? "pr-3"
          : isLaptop
          ? "pr-5"
          : "pr-6"
      )}
    >
      {/* Primera fila: Logo y acciones */}
      <div
        className={cn(
          "flex items-center",
          // Height: mobile h-14, laptop h-[60px], desktop h-16
          isMobile ? "h-14" : isLaptop ? "h-[60px]" : "h-16",
          // Gap: mobile gap-2, laptop gap-3, desktop gap-4
          isMobile ? "gap-2" : isLaptop ? "gap-3" : "gap-4",
          // Padding horizontal: mobile px-3, laptop px-5, desktop px-6
          isMobile ? "px-3" : isLaptop ? "px-5" : "px-6"
        )}
      >
        <SidebarTrigger className="text-white h-10 w-10 md:h-10 md:w-10" />
        {!isMobile && (
          <Separator orientation="vertical" className="h-6 bg-gray-600" />
        )}
        <h1
          className={cn(
            "font-bold text-white",
            isMobile ? "text-lg" : "text-xl"
          )}
        >
          {isMobile ? "QS" : "QuickSnap"}
        </h1>
        <div
          className={cn("ml-auto flex items-center gap-2", isMobile && "gap-1")}
        >
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
      </div>

      {/* Segunda fila: Toolbar */}
      {!isMobile && (
        <div className="border-t border-gray-700 px-4 py-2">
          <EditorToolbar
            onFileUpload={onFileUpload}
            onRemoveBackground={onRemoveBackground}
          />
        </div>
      )}
    </header>
  );
};
