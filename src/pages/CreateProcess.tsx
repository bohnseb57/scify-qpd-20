import { useNavigate } from "react-router-dom";
import { ProcessWizard } from "@/components/ProcessWizard";

export default function CreateProcess() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Create New Process</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new quality process with custom fields and workflow steps.
        </p>
      </div>
      <ProcessWizard onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  );
}