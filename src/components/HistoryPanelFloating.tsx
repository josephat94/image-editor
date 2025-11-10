import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RotateCcw, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { HistoryPanel } from "@/components/HistoryPanel";
import { useCanvasContext } from "@/contexts/CanvasContext";
import { useUIStore } from "@/stores/uiStore";

export const HistoryPanelFloating: React.FC = () => {
  const { isHistoryPanelOpen, setHistoryPanelOpen } = useUIStore();
  const { getHistoryList, goToHistoryState, clearHistory, historyVersion } =
    useCanvasContext();
  const history = getHistoryList();

  return (
    <>
      {/* Panel derecho flotante - Historial */}
      <div
        className={`fixed right-0 top-0 bottom-0 bg-gray-900 border-l-2 border-gray-700 shadow-2xl z-30 flex flex-col transition-all duration-300 ${
          isHistoryPanelOpen ? "w-80" : "w-0"
        }`}
      >
        <div className={`${isHistoryPanelOpen ? "block" : "hidden"}`}>
          <div className="border-b border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30 shadow-lg shadow-blue-500/10">
                  <RotateCcw className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Historial
                  </h2>
                  <p className="text-xs text-gray-400">
                    {history.length}{" "}
                    {history.length === 1 ? "cambio" : "cambios"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setHistoryPanelOpen(false)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cerrar panel</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        if (
                          window.confirm(
                            "¿Estás seguro de que quieres limpiar todo el historial? Esta acción no se puede deshacer."
                          )
                        ) {
                          clearHistory();
                        }
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Limpiar historial</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div id="history-panel" className="h-full">
              <HistoryPanel
                history={history}
                onGoToState={goToHistoryState}
                historyVersion={historyVersion}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante para abrir el panel de historial */}
      {!isHistoryPanelOpen && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setHistoryPanelOpen(true)}
                className="rounded-l-lg rounded-r-none h-16 w-10 bg-gray-900 hover:bg-gray-800 border-2 border-r-0 border-gray-700 shadow-xl"
              >
                <div className="flex flex-col items-center gap-1">
                  <ChevronLeft className="w-4 h-4 text-blue-400" />
                  <RotateCcw className="w-4 h-4 text-blue-400" />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir historial</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </>
  );
};
