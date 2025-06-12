
import { MetricCard } from "@/components/MetricCard";
import { PendingOrganizationsWidget } from "@/components/PendingOrganizationsWidget";
import { PendingScholarshipsWidget } from "@/components/PendingScholarshipsWidget";
import { PendingDonationsRequestsWidget } from "@/components/PendingDonationsRequestsWidget";
import { PendingEventsWidget } from "@/components/PendingEventsWidget";
import { useAuth } from "@/hooks/useAuth";
import { useMonthlyMetrics } from "@/hooks/useMonthlyMetrics";
import { useYearlyMetrics } from "@/hooks/useYearlyMetrics";
import {
  Users,
  DollarSign,
  GraduationCap,
  Calendar,
  Building2,
  Clock,
  MessageSquare,
  Calculator,
} from "lucide-react";

export const Overview = () => {
  const { isAdministrator } = useAuth();
  const { data: monthlyMetrics, isLoading: monthlyLoading } = useMonthlyMetrics();
  const { data: yearlyMetrics, isLoading: yearlyLoading } = useYearlyMetrics();

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Welcome to your Roll Call dashboard
        </p>
      </div>

      {/* Pending Approvals Section - Only show for administrators */}
      {isAdministrator && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Pending Approvals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PendingOrganizationsWidget />
            <PendingScholarshipsWidget />
            <PendingDonationsRequestsWidget />
            <PendingEventsWidget />
          </div>
        </div>
      )}

      {/* This Month's Metrics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">This Month's Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="New Organizations"
            value={monthlyLoading ? "..." : formatNumber(monthlyMetrics?.newOrganizations || 0)}
            change="+3"
            changeType="positive"
            icon={Building2}
          />
          <MetricCard
            title="Scholarships"
            value={monthlyLoading ? "..." : formatNumber(monthlyMetrics?.newScholarships || 0)}
            change="+2"
            changeType="positive"
            icon={GraduationCap}
          />
          <MetricCard
            title="Donations"
            value={monthlyLoading ? "..." : formatCurrency(monthlyMetrics?.totalDonations || 0)}
            change="+18.5%"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Events"
            value={monthlyLoading ? "..." : formatNumber(monthlyMetrics?.newEvents || 0)}
            change="+1"
            changeType="positive"
            icon={Calendar}
          />
          <MetricCard
            title="New Users"
            value={monthlyLoading ? "..." : formatNumber(monthlyMetrics?.newUsers || 0)}
            change="+22.1%"
            changeType="positive"
            icon={Users}
          />
        </div>
      </div>

      {/* Year Metrics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Year Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Organizations"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.organizations || 0)}
            change="+32.1%"
            changeType="positive"
            icon={Building2}
          />
          <MetricCard
            title="Donations"
            value={yearlyLoading ? "..." : formatCurrency(yearlyMetrics?.totalDonations || 0)}
            change="+28.5%"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Events"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.events || 0)}
            change="+15.2%"
            changeType="positive"
            icon={Calendar}
          />
          <MetricCard
            title="Hours Donated"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.hoursDonated || 0)}
            change="+41.3%"
            changeType="positive"
            icon={Clock}
          />
          <MetricCard
            title="Posts"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.posts || 0)}
            change="+19.7%"
            changeType="positive"
            icon={MessageSquare}
          />
          <MetricCard
            title="Financial Totals"
            value={yearlyLoading ? "..." : formatCurrency(yearlyMetrics?.financialTotals || 0)}
            change="+24.8%"
            changeType="positive"
            icon={Calculator}
          />
        </div>
      </div>
    </div>
  );
};
