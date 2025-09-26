import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import ProcessDetails from "./pages/ProcessDetails";
import RecordDetails from "./pages/RecordDetails";
import CreateProcess from "./pages/CreateProcess";
import ProcessConfigurationList from "./pages/ProcessConfigurationList";
import ProcessConfiguration from "./pages/ProcessConfiguration";
import ProcessFieldsConfiguration from "./pages/ProcessFieldsConfiguration";
import ProcessWorkflowConfiguration from "./pages/ProcessWorkflowConfiguration";
import StartWork from "./pages/StartWork";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log("🚀 App component rendering");
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="start-work" element={<StartWork />} />
            <Route path="process/:id" element={<ProcessDetails />} />
            <Route path="create-process" element={<CreateProcess />} />
            <Route path="process-config" element={<ProcessConfigurationList />} />
            <Route path="process-config/:id" element={<ProcessConfiguration />} />
            <Route path="process-config/:id/fields" element={<ProcessFieldsConfiguration />} />
            <Route path="process-config/:id/workflow" element={<ProcessWorkflowConfiguration />} />
          </Route>
          <Route path="/record/:id" element={<RecordDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
