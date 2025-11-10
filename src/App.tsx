import ImageEditor from "./components/ImageEditor";
import { SidebarProvider } from "./components/ui/sidebar";

import { Analytics } from "@vercel/analytics/next";

function App() {
  return (
    <SidebarProvider defaultOpen={true}>
      <ImageEditor />
      <Analytics />
    </SidebarProvider>
  );
}

export default App;
