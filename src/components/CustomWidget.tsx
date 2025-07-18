
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWidgetCalculations, calculateEquationValue, formatWidgetValue } from "@/hooks/useWidgetCalculations";
import { usePreviousMonthMetrics } from "@/hooks/usePreviousMonthMetrics";
import { usePreviousYearMetrics } from "@/hooks/usePreviousYearMetrics";
import { useMetricChanges } from "@/hooks/useMetricChanges";

interface CustomWidgetProps {
  title: string;
  description?: string;
  metrics: any[];
  displayConfig: any;
  section?: string;
}

export const CustomWidget = ({ title, description, metrics, displayConfig, section }: CustomWidgetProps) => {
  const { data: widgetData, isLoading } = useWidgetCalculations();
  const { data: previousMonthMetrics, isLoading: previousMonthLoading } = usePreviousMonthMetrics();
  const { data: previousYearMetrics, isLoading: previousYearLoading } = usePreviousYearMetrics();
  const { calculateChange } = useMetricChanges();

  const getDisplayValue = () => {
    if (isLoading || !widgetData) return "...";
    
    if (displayConfig?.equation && displayConfig.equation.length > 0) {
      const calculatedValue = calculateEquationValue(displayConfig.equation, widgetData);
      const format = displayConfig.valueFormat || 'number';
      return formatWidgetValue(calculatedValue, format);
    }
    
    // Fallback to original logic for backwards compatibility
    return metrics.length > 0 ? metrics[0].value || "0" : "0";
  };

  const getChangeData = () => {
    if (!displayConfig?.equation || displayConfig.equation.length === 0 || !widgetData) {
      return { change: "", changeType: "neutral" as const, label: "" };
    }

    const currentValue = calculateEquationValue(displayConfig.equation, widgetData);

    // Determine which previous period to use based on section
    if (section === 'monthly_metrics' && previousMonthMetrics && !previousMonthLoading) {
      const previousCalculatedValues = {
        calculations: {
          donations_count: 0, // Previous month doesn't track individual donations count
          donations_amount: previousMonthMetrics.totalDonations,
          donations_approved: 0,
          donations_pending: 0,
          requests_count: 0,
          requests_approved: 0, 
          requests_pending: 0,
          requests_completed: 0,
          scholarships_count: previousMonthMetrics.newScholarships,
          scholarships_amount: 0,
          scholarships_approved: 0,
          scholarships_pending: 0,
          events_count: previousMonthMetrics.newEvents,
          events_approved: 0,
          events_pending: 0,
        },
        rawData: { donations: [], requests: [], scholarships: [], events: [] }
      };
      
      const previousValue = calculateEquationValue(displayConfig.equation, previousCalculatedValues);
      const changeResult = calculateChange(currentValue, previousValue);
      return { ...changeResult, label: "from last month" };
    } else if (section === 'yearly_metrics' && previousYearMetrics && !previousYearLoading) {
      const previousCalculatedValues = {
        calculations: {
          donations_count: 0,
          donations_amount: previousYearMetrics.totalDonations,
          donations_approved: 0,
          donations_pending: 0,
          requests_count: 0,
          requests_approved: 0,
          requests_pending: 0,
          requests_completed: 0,
          scholarships_count: 0,
          scholarships_amount: 0,
          scholarships_approved: 0,
          scholarships_pending: 0,
          events_count: previousYearMetrics.events,
          events_approved: 0,
          events_pending: 0,
        },
        rawData: { donations: [], requests: [], scholarships: [], events: [] }
      };
      
      const previousValue = calculateEquationValue(displayConfig.equation, previousCalculatedValues);
      const changeResult = calculateChange(currentValue, previousValue);
      return { ...changeResult, label: "from last year" };
    }

    return { change: "...", changeType: "neutral" as const, label: "" };
  };

  const changeData = getChangeData();

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
        <div className="flex items-center justify-between mt-1">
          {changeData.change && changeData.change !== "..." ? (
            <p className={`text-xs ${
              changeData.changeType === "positive" 
                ? "text-green-600" 
                : changeData.changeType === "negative" 
                ? "text-red-600" 
                : "text-muted-foreground"
            }`}>
              {changeData.change} {changeData.label}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {displayConfig.subtitle || "Custom metric"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
