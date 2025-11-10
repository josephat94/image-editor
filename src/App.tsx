import ImageEditor from "./components/ImageEditor";
import { SidebarProvider } from "./components/ui/sidebar";

import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <SidebarProvider defaultOpen={true}>
      <ImageEditor />
      <Analytics />
    </SidebarProvider>
  );
}

export default App;
