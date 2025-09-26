import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Target, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProcessDiscoveryProps {
  onProcessSelected: (processId: string, processName: string) => void;
  onSkip: () => void;
}

interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface Question {
  id: string;
  title: string;
  description: string;
  options: QuestionOption[];
  multiSelect?: boolean;
}

export function ProcessDiscovery({ onProcessSelected, onSkip }: ProcessDiscoveryProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

  const questions: Question[] = [
    {
      id: "situation_type",
      title: "What type of situation are you dealing with today?",
      description: "This helps us understand the nature of your work and recommend the most appropriate process.",
      options: [
        {
          id: "quality_issue",
          label: "Quality issue or deviation detected",
          description: "Product doesn't meet specifications or standards",
          icon: <AlertTriangle className="h-5 w-5 text-warning" />
        },
        {
          id: "customer_complaint",
          label: "Customer complaint received",
          description: "External feedback about product or service issues",
          icon: <Target className="h-5 w-5 text-destructive" />
        },
        {
          id: "audit_finding",
          label: "Internal audit finding",
          description: "Non-conformance identified during internal review",
          icon: <CheckCircle className="h-5 w-5 text-sl-blue-600" />
        },
        {
          id: "improvement_opportunity",
          label: "Process improvement opportunity",
          description: "Proactive enhancement to prevent future issues",
          icon: <Target className="h-5 w-5 text-success" />
        },
        {
          id: "risk_assessment",
          label: "Risk assessment follow-up",
          description: "Action required based on risk analysis",
          icon: <AlertTriangle className="h-5 w-5 text-warning" />
        }
      ]
    },
    {
      id: "impact_severity",
      title: "How would you describe the impact or severity?",
      description: "Understanding the impact helps prioritize and route your request appropriately.",
      options: [
        {
          id: "product_safety",
          label: "Affects product quality/safety",
          description: "Could impact patient safety or product efficacy",
          icon: <AlertTriangle className="h-5 w-5 text-destructive" />
        },
        {
          id: "customer_satisfaction",
          label: "Affects customer satisfaction",
          description: "Customer experience or satisfaction impact",
          icon: <Target className="h-5 w-5 text-warning" />
        },
        {
          id: "regulatory_compliance",
          label: "Regulatory/compliance concern",
          description: "May affect regulatory compliance or reporting",
          icon: <CheckCircle className="h-5 w-5 text-sl-blue-600" />
        },
        {
          id: "process_efficiency",
          label: "Process efficiency issue",
          description: "Impacts operational efficiency or workflow",
          icon: <Clock className="h-5 w-5 text-sl-blue-500" />
        },
        {
          id: "cost_impact",
          label: "Cost impact",
          description: "Financial implications or resource waste",
          icon: <Target className="h-5 w-5 text-warning" />
        },
        {
          id: "minor_impact",
          label: "No immediate impact but needs attention",
          description: "Preventive measure or minor improvement",
          icon: <CheckCircle className="h-5 w-5 text-success" />
        }
      ]
    },
    {
      id: "action_type",
      title: "What type of action do you think is needed?",
      description: "This helps us understand whether you need corrective, preventive, or both types of actions.",
      options: [
        {
          id: "corrective",
          label: "Fix the immediate problem (Corrective)",
          description: "Address the root cause of an existing issue",
          icon: <AlertTriangle className="h-5 w-5 text-warning" />
        },
        {
          id: "preventive",
          label: "Prevent similar issues in the future (Preventive)",
          description: "Implement measures to prevent potential problems",
          icon: <CheckCircle className="h-5 w-5 text-success" />
        },
        {
          id: "both",
          label: "Both corrective and preventive actions",
          description: "Comprehensive approach addressing current and future risks",
          icon: <Target className="h-5 w-5 text-sl-blue-600" />
        },
        {
          id: "unsure",
          label: "Not sure, need guidance",
          description: "Would benefit from expert guidance on approach",
          icon: <Clock className="h-5 w-5 text-muted-foreground" />
        }
      ]
    },
    {
      id: "timeline",
      title: "How urgent is this matter?",
      description: "Timeline helps us prioritize and ensure appropriate resources are allocated.",
      options: [
        {
          id: "immediate",
          label: "Immediate attention required",
          description: "Critical issue requiring urgent action",
          icon: <AlertTriangle className="h-5 w-5 text-destructive" />
        },
        {
          id: "this_week",
          label: "Should be addressed this week",
          description: "Important but not critical",
          icon: <Clock className="h-5 w-5 text-warning" />
        },
        {
          id: "next_month",
          label: "Can be planned for next month",
          description: "Standard priority planning",
          icon: <CheckCircle className="h-5 w-5 text-sl-blue-600" />
        },
        {
          id: "long_term",
          label: "Long-term improvement initiative",
          description: "Strategic improvement with flexible timeline",
          icon: <Target className="h-5 w-5 text-success" />
        }
      ]
    }
  ];

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [optionId]
    }));
  };

  const getCurrentAnswer = (questionId: string): string | undefined => {
    return answers[questionId]?.[0];
  };

  const isStepComplete = (stepIndex: number): boolean => {
    const question = questions[stepIndex];
    return !!answers[question.id]?.length;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All questions completed - determine recommendation
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // For this prototype, any combination of answers leads to CAPA
    // In a real implementation, this would have more sophisticated logic
    const capaProcessId = "59913940-014c-4c93-b90b-bf69b591ab1f"; // Known CAPA process ID
    onProcessSelected(capaProcessId, "CAPA");
  };

  const generateRecommendationText = (): string => {
    const situationType = answers.situation_type?.[0];
    const impactSeverity = answers.impact_severity?.[0];
    const actionType = answers.action_type?.[0];
    
    if (situationType === "quality_issue" || situationType === "customer_complaint") {
      return "Based on your responses, a CAPA (Corrective and Preventive Action) process is strongly recommended. This will help you systematically address the issue and prevent recurrence.";
    }
    
    if (actionType === "both" || actionType === "corrective") {
      return "Your situation calls for a structured CAPA approach to ensure both immediate correction and long-term prevention measures are implemented effectively.";
    }
    
    return "A CAPA process will provide the structured framework needed to properly document, investigate, and resolve your quality concern while preventing similar issues in the future.";
  };

  const currentQuestion = questions[currentStep];
  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button variant="ghost" onClick={onSkip}>
              Skip to Process Selection
            </Button>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Smart Process Discovery
            </h1>
            <p className="text-muted-foreground text-lg">
              Let's find the best process for your quality management needs
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Step {currentStep + 1} of {questions.length}
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-elegant mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
            <CardDescription className="text-base">
              {currentQuestion.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.options.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-card ${
                  getCurrentAnswer(currentQuestion.id) === option.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleAnswer(currentQuestion.id, option.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {option.icon}
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">
                        {option.label}
                      </h3>
                      {option.description && (
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>
                    {getCurrentAnswer(currentQuestion.id) === option.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index < currentStep
                    ? "bg-success"
                    : index === currentStep
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!isStepComplete(currentStep)}
            className="flex items-center gap-2 bg-gradient-primary hover:bg-primary-hover"
          >
            {currentStep === questions.length - 1 ? "Get Recommendation" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Show recommendation preview on last step */}
        {currentStep === questions.length - 1 && isStepComplete(currentStep) && (
          <Card className="mt-8 shadow-elegant border-success/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Target className="h-5 w-5" />
                Recommended Process: CAPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {generateRecommendationText()}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Corrective & Preventive Action
                </Badge>
                <Badge variant="outline" className="bg-sl-blue-50 text-sl-blue-700 border-sl-blue-200">
                  Quality Management
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}