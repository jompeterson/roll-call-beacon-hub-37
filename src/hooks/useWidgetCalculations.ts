
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWidgetCalculations = () => {
  return useQuery({
    queryKey: ["widget-calculations"],
    queryFn: async () => {
      console.log('Fetching widget calculation data...');
      
      // Fetch all required data for calculations
      const [
        { data: donations },
        { data: requests },
        { data: scholarships },
        { data: events }
      ] = await Promise.all([
        supabase.from('donations').select('*'),
        supabase.from('requests').select('*'),
        supabase.from('scholarships').select('*'),
        supabase.from('events').select('*')
      ]);

      // Calculate values
      const calculations = {
        donations_count: donations?.length || 0,
        donations_amount: donations?.reduce((sum, d) => sum + (d.amount_needed || 0), 0) || 0,
        donations_approved: donations?.filter(d => d.is_approved).length || 0,
        donations_pending: donations?.filter(d => !d.is_approved && !d.approval_decision_made).length || 0,
        
        requests_count: requests?.length || 0,
        requests_approved: requests?.filter(r => r.is_approved).length || 0,
        requests_pending: requests?.filter(r => !r.is_approved && !r.approval_decision_made).length || 0,
        requests_completed: requests?.filter(r => r.is_completed).length || 0,
        
        scholarships_count: scholarships?.length || 0,
        scholarships_amount: scholarships?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0,
        scholarships_approved: scholarships?.filter(s => s.is_approved).length || 0,
        scholarships_pending: scholarships?.filter(s => !s.is_approved && !s.approval_decision_made).length || 0,
        
        events_count: events?.length || 0,
        events_approved: events?.filter(e => e.is_approved).length || 0,
        events_pending: events?.filter(e => !e.is_approved && !e.approval_decision_made).length || 0,
      };

      console.log('Calculated widget values:', calculations);
      return calculations;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const calculateEquationValue = (equation: any[], calculatedValues: any): number => {
  if (!equation || equation.length === 0) {
    return 0;
  }

  let result = 0;
  let currentOperation = '+';

  for (const element of equation) {
    let value = 0;

    if (element.type === 'value') {
      value = calculatedValues[element.id] || 0;
    } else if (element.type === 'number') {
      value = element.value || 0;
    } else if (element.type === 'operator') {
      currentOperation = element.operator;
      continue;
    }

    switch (currentOperation) {
      case '+':
        result += value;
        break;
      case '-':
        result -= value;
        break;
      case '*':
        result *= value;
        break;
      case '/':
        if (value !== 0) {
          result /= value;
        }
        break;
      default:
        result += value;
    }
  }

  return result;
};

export const formatWidgetValue = (value: number, format: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(2)}%`;
    case 'decimal':
      return value.toFixed(2);
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(Math.round(value));
  }
};
