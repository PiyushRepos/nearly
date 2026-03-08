import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { AuthProvider } from "@/context/AuthContext.tsx";
import { SWRProvider } from "@/lib/swr-config.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRProvider>
      <AuthProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </AuthProvider>
    </SWRProvider>
  </StrictMode>,
);
