import { useState } from "react";
import { ProcessDiscovery } from "@/components/ProcessDiscovery";
import { GuidedRecordCreation } from "@/components/GuidedRecordCreation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

type WorkflowStep = "discovery" | "process-selection" | "record-creation";

export default function StartWork() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("discovery");
  const [selectedProcess, setSelectedProcess] = useState<{
    id: string;
    name: string;
    discoveryAnswers?: any;
  } | null>(null);
  const navigate = useNavigate();

  const handleProcessSelected = (processId: string, processName: string, discoveryAnswers?: any) => {
    setSelectedProcess({ id: processId, name: processName, discoveryAnswers });
    setCurrentStep("record-creation");
  };

  const handleSkipToSelection = () => {
    setCurrentStep("process-selection");
  };

  const handleComplete = () => {
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (currentStep === "discovery") {
    return (
      <ProcessDiscovery 
        onProcessSelected={handleProcessSelected}
        onSkip={handleSkipToSelection}
      />
    );
  }

  if (currentStep === "record-creation" && selectedProcess) {
    return (
      <GuidedRecordCreation
        processId={selectedProcess.id}
        processName={selectedProcess.name}
        discoveryAnswers={selectedProcess.discoveryAnswers}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    );
  }

  // Process selection fallback (when user skips discovery)
  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={() => navigate("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button variant="ghost" onClick={() => setCurrentStep("discovery")}>
              Use Guided Discovery
            </Button>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Select a Process
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose the quality process that best fits your needs
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* CAPA Process Card */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-elegant"
            onClick={() => handleProcessSelected("59913940-014c-4c93-b90b-bf69b591ab1f", "CAPA")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Target className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">CAPA (Corrective & Preventive Action)</CardTitle>
                    <CardDescription className="text-base">
                      Systematic approach to identify root causes, implement corrective actions, and prevent recurrence of quality issues.
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Select Process
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Quality Management
                </Badge>
                <Badge variant="outline" className="bg-sl-blue-50 text-sl-blue-700 border-sl-blue-200">
                  Root Cause Analysis
                </Badge>
                <Badge variant="outline">Risk Management</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2"><strong>Best for:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Quality deviations and non-conformances</li>
                  <li>Customer complaints and feedback</li>
                  <li>Internal audit findings</li>
                  <li>Process improvement opportunities</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for other processes */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">Other Quality Processes</CardTitle>
                    <CardDescription className="text-base">
                      Additional quality management processes will be available here.
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="opacity-50">Document Control</Badge>
                <Badge variant="outline" className="opacity-50">Change Control</Badge>
                <Badge variant="outline" className="opacity-50">Supplier Management</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}