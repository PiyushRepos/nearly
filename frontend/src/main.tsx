import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { AuthProvider } from "@/context/AuthContext.tsx";
import { SWRProvider } from "@/lib/swr-config.tsx";

// When Vite can't fetch a lazy-loaded chunk (stale hash after a new deploy),
// force a hard reload so the browser picks up the latest index.html + assets.
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

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
