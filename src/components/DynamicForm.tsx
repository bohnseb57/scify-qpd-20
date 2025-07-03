import { ProcessField } from "@/types/qpd";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface DynamicFormProps {
  fields: ProcessField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  readOnly?: boolean;
}

export function DynamicForm({ fields, values, onChange, readOnly = false }: DynamicFormProps) {
  const renderField = (field: ProcessField) => {
    const value = values[field.id] || '';
    
    const handleChange = (newValue: string) => {
      if (!readOnly) {
        onChange(field.id, newValue);
      }
    };

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.field_type}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
            disabled={readOnly}
            required={field.is_required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
            disabled={readOnly}
            required={field.is_required}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={readOnly}
            required={field.is_required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
            disabled={readOnly}
            required={field.is_required}
            rows={4}
          />
        );

      case 'select':
        const options = Array.isArray(field.field_options) 
          ? field.field_options 
          : field.field_options ? JSON.parse(field.field_options as any) : [];
        
        return (
          <Select 
            value={value} 
            onValueChange={handleChange}
            disabled={readOnly}
            required={field.is_required}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.field_label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === 'true'}
              onCheckedChange={(checked) => handleChange(checked ? 'true' : 'false')}
              disabled={readOnly}
            />
            <Label className="text-sm font-normal">
              {field.field_label}
            </Label>
          </div>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
            disabled={readOnly}
            required={field.is_required}
          />
        );
    }
  };

  const sortedFields = [...fields].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6">
      {sortedFields.map((field) => (
        <Card key={field.id} className="p-4">
          <CardContent className="p-0 space-y-3">
            {field.field_type !== 'checkbox' && (
              <Label htmlFor={field.id} className="text-sm font-medium text-foreground">
                {field.field_label}
                {field.is_required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            {renderField(field)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}