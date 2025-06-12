
interface MetricChangeResult {
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

export const useMetricChanges = () => {
  const calculateChange = (current: number, previous: number): MetricChangeResult => {
    if (previous === 0) {
      if (current > 0) {
        return { change: "+100%", changeType: "positive" };
      }
      return { change: "0%", changeType: "neutral" };
    }

    const percentChange = ((current - previous) / previous) * 100;
    const formattedChange = Math.abs(percentChange).toFixed(1);
    
    if (percentChange > 0) {
      return { change: `+${formattedChange}%`, changeType: "positive" };
    } else if (percentChange < 0) {
      return { change: `-${formattedChange}%`, changeType: "negative" };
    } else {
      return { change: "0%", changeType: "neutral" };
    }
  };

  const calculateAbsoluteChange = (current: number, previous: number): MetricChangeResult => {
    const absoluteChange = current - previous;
    
    if (absoluteChange > 0) {
      return { change: `+${absoluteChange}`, changeType: "positive" };
    } else if (absoluteChange < 0) {
      return { change: `${absoluteChange}`, changeType: "negative" };
    } else {
      return { change: "0", changeType: "neutral" };
    }
  };

  return { calculateChange, calculateAbsoluteChange };
};
