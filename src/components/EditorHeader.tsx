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
import { useUIStore } from "@/stores/uiStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  onRestartTour: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onRestartTour,
}) => {
  const isHistoryPanelOpen = useUIStore((state) => state.isHistoryPanelOpen);
  const isMobile = useIsMobile();

  return (
    <header
      id="editor-header"
      className={cn(
        "flex h-14 md:h-16 shrink-0 items-center gap-2 md:gap-4 border-b border-gray-700 px-3 md:px-6 bg-gray-800 transition-all duration-300",
        !isMobile && isHistoryPanelOpen ? "pr-[22rem]" : "pr-4"
      )}
    >
      <SidebarTrigger className="text-white h-10 w-10 md:h-10 md:w-10" />
      {!isMobile && (
        <Separator orientation="vertical" className="h-6 bg-gray-600" />
      )}
      <h1
        className={cn("font-bold text-white", isMobile ? "text-lg" : "text-xl")}
      >
        {isMobile ? "QS" : "QuickSnap"}
      </h1>
      {!isMobile && (
        <div className="ml-auto">
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
        </div>
      )}
    </header>
  );
};
