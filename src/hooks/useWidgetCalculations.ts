
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
        donations_weight: donations?.reduce((sum, d) => sum + (d.weight || 0), 0) || 0,
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
      return {
        calculations,
        rawData: { donations, requests, scholarships, events }
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

const applyFilters = (data: any[], filters: any[]): any[] => {
  if (!filters || filters.length === 0) return data;
  
  return data.filter(item => {
    return filters.every(filter => {
      if (!filter.field || filter.value === undefined || filter.value === '') return true;
      
      const itemValue = item[filter.field];
      const filterValue = filter.value;
      
      switch (filter.operator) {
        case 'equals':
          if (typeof itemValue === 'boolean') {
            return itemValue === (filterValue === 'true');
          }
          return String(itemValue) === String(filterValue);
        
        case 'not_equals':
          if (typeof itemValue === 'boolean') {
            return itemValue !== (filterValue === 'true');
          }
          return String(itemValue) !== String(filterValue);
        
        case 'greater_than':
          return Number(itemValue) > Number(filterValue);
        
        case 'less_than':
          return Number(itemValue) < Number(filterValue);
        
        case 'greater_equal':
          return Number(itemValue) >= Number(filterValue);
        
        case 'less_equal':
          return Number(itemValue) <= Number(filterValue);
        
        case 'contains':
          return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
        
        default:
          return true;
      }
    });
  });
};

const calculateFilteredValue = (data: any[], valueType: string, filters: any[]): number => {
  const filteredData = applyFilters(data, filters);
  
  switch (valueType) {
    case 'donations_count':
    case 'requests_count':
    case 'scholarships_count':
    case 'events_count':
      return filteredData.length;
    
    case 'donations_amount':
      return filteredData.reduce((sum, d) => sum + (d.amount_needed || 0), 0);
    
    case 'donations_weight':
      return filteredData.reduce((sum, d) => sum + (d.weight || 0), 0);
    
    case 'scholarships_amount':
      return filteredData.reduce((sum, s) => sum + (s.amount || 0), 0);
    
    case 'donations_approved':
      return filteredData.filter(d => d.is_approved).length;
    
    case 'donations_pending':
      return filteredData.filter(d => !d.is_approved && !d.approval_decision_made).length;
    
    case 'requests_approved':
      return filteredData.filter(r => r.is_approved).length;
    
    case 'requests_pending':
      return filteredData.filter(r => !r.is_approved && !r.approval_decision_made).length;
    
    case 'requests_completed':
      return filteredData.filter(r => r.is_completed).length;
    
    case 'scholarships_approved':
      return filteredData.filter(s => s.is_approved).length;
    
    case 'scholarships_pending':
      return filteredData.filter(s => !s.is_approved && !s.approval_decision_made).length;
    
    case 'events_approved':
      return filteredData.filter(e => e.is_approved).length;
    
    case 'events_pending':
      return filteredData.filter(e => !e.is_approved && !e.approval_decision_made).length;
    
    default:
      return 0;
  }
};

export const calculateEquationValue = (equation: any[], widgetData: any): number => {
  if (!equation || equation.length === 0) {
    return 0;
  }

  const { calculations, rawData } = widgetData;
  let result = 0;
  let currentOperation = '+';

  for (const element of equation) {
    let value = 0;

    if (element.type === 'value') {
      // Check if element has filters
      if (element.filters && element.filters.length > 0) {
        // Determine which dataset to use based on the value type
        let dataset: any[] = [];
        const valueType = element.id;
        
        if (valueType.startsWith('donations_')) {
          dataset = rawData.donations || [];
        } else if (valueType.startsWith('requests_')) {
          dataset = rawData.requests || [];
        } else if (valueType.startsWith('scholarships_')) {
          dataset = rawData.scholarships || [];
        } else if (valueType.startsWith('events_')) {
          dataset = rawData.events || [];
        }
        
        value = calculateFilteredValue(dataset, valueType, element.filters);
      } else {
        // Use pre-calculated values for unfiltered data
        value = calculations[element.id] || 0;
      }
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
    case 'weight':
      return `${value.toFixed(2)} lbs`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(Math.round(value));
  }
};
