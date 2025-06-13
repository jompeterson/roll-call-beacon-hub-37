
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWidgetCalculations, calculateEquationValue, formatWidgetValue } from "@/hooks/useWidgetCalculations";

interface CustomWidgetProps {
  title: string;
  description?: string;
  metrics: any[];
  displayConfig: any;
}

export const CustomWidget = ({ title, description, metrics, displayConfig }: CustomWidgetProps) => {
  const { data: calculatedValues, isLoading } = useWidgetCalculations();

  const getDisplayValue = () => {
    if (isLoading) return "...";
    
    if (displayConfig?.equation && displayConfig.equation.length > 0 && calculatedValues) {
      const calculatedValue = calculateEquationValue(displayConfig.equation, calculatedValues);
      const format = displayConfig.valueFormat || 'number';
      return formatWidgetValue(calculatedValue, format);
    }
    
    // Fallback to original logic for backwards compatibility
    return metrics.length > 0 ? metrics[0].value || "0" : "0";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {getDisplayValue()}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {displayConfig.subtitle || "Custom metric"}
        </p>
      </CardContent>
    </Card>
  );
};
