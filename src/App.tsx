import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { MagicalCursor } from "@/components/MagicalCursor";
import { PageFlipWrapper } from "@/components/PageFlipWrapper";
import Home from "./pages/Home";
import Library from "./pages/Library";
import RestrictedSection from "./pages/RestrictedSection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CartProvider>
        <TooltipProvider>
          <MagicalCursor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PageFlipWrapper>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/restricted-section" element={<RestrictedSection />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageFlipWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
