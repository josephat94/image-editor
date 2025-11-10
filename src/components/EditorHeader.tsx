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

interface EditorHeaderProps {
  onRestartTour: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onRestartTour,
}) => {
  const isHistoryPanelOpen = useUIStore((state) => state.isHistoryPanelOpen);

  return (
    <header
      id="editor-header"
      className={`flex h-16 shrink-0 items-center gap-4 border-b border-gray-700 px-6 bg-gray-800 transition-all duration-300 ${
        isHistoryPanelOpen ? "pr-[22rem]" : "pr-4"
      }`}
    >
      <SidebarTrigger className="text-white" />
      <Separator orientation="vertical" className="h-6 bg-gray-600" />
      <h1 className="text-xl font-bold text-white">QuickSnap</h1>
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
    </header>
  );
};
