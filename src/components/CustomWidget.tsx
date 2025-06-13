
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomWidgetProps {
  title: string;
  description?: string;
  metrics: any[];
  displayConfig: any;
}

export const CustomWidget = ({ title, description, metrics, displayConfig }: CustomWidgetProps) => {
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
          {metrics.length > 0 ? metrics[0].value || "0" : "0"}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {displayConfig.subtitle || "Custom metric"}
        </p>
      </CardContent>
    </Card>
  );
};
