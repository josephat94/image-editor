import ImageEditor from "./components/ImageEditor";
import { SidebarProvider } from "./components/ui/sidebar";

function App() {
  return (
    <SidebarProvider defaultOpen={true}>
      <ImageEditor />;
    </SidebarProvider>
  );
}

export default App;
