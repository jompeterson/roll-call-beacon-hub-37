
import { MetricCard } from "@/components/MetricCard";
import { PendingOrganizationsWidget } from "@/components/PendingOrganizationsWidget";
import { PendingScholarshipsWidget } from "@/components/PendingScholarshipsWidget";
import { PendingDonationsRequestsWidget } from "@/components/PendingDonationsRequestsWidget";
import { PendingEventsWidget } from "@/components/PendingEventsWidget";
import { CustomWidget } from "@/components/CustomWidget";
import { useAuth } from "@/hooks/useAuth";
import { useMonthlyMetrics } from "@/hooks/useMonthlyMetrics";
import { useYearlyMetrics } from "@/hooks/useYearlyMetrics";
import { usePreviousMonthMetrics } from "@/hooks/usePreviousMonthMetrics";
import { usePreviousYearMetrics } from "@/hooks/usePreviousYearMetrics";
import { useMetricChanges } from "@/hooks/useMetricChanges";
import { useCustomWidgets } from "@/hooks/useCustomWidgets";
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
  const { data: previousMonthMetrics, isLoading: previousMonthLoading } = usePreviousMonthMetrics();
  const { data: previousYearMetrics, isLoading: previousYearLoading } = usePreviousYearMetrics();
  const { calculateChange, calculateAbsoluteChange } = useMetricChanges();
  
  // Fetch custom widgets for each section
  const { data: pendingApprovalsWidgets } = useCustomWidgets('pending_approvals');
  const { data: monthlyMetricsWidgets } = useCustomWidgets('monthly_metrics');
  const { data: yearlyMetricsWidgets } = useCustomWidgets('yearly_metrics');

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

  // Calculate monthly changes
  const orgChange = !monthlyLoading && !previousMonthLoading && monthlyMetrics && previousMonthMetrics 
    ? calculateAbsoluteChange(monthlyMetrics.newOrganizations, previousMonthMetrics.newOrganizations)
    : { change: "...", changeType: "neutral" as const };

  const scholarshipChange = !monthlyLoading && !previousMonthLoading && monthlyMetrics && previousMonthMetrics 
    ? calculateAbsoluteChange(monthlyMetrics.newScholarships, previousMonthMetrics.newScholarships)
    : { change: "...", changeType: "neutral" as const };

  const monthlyDonationChange = !monthlyLoading && !previousMonthLoading && monthlyMetrics && previousMonthMetrics 
    ? calculateChange(monthlyMetrics.totalDonations, previousMonthMetrics.totalDonations)
    : { change: "...", changeType: "neutral" as const };

  const eventChange = !monthlyLoading && !previousMonthLoading && monthlyMetrics && previousMonthMetrics 
    ? calculateAbsoluteChange(monthlyMetrics.newEvents, previousMonthMetrics.newEvents)
    : { change: "...", changeType: "neutral" as const };

  const userChange = !monthlyLoading && !previousMonthLoading && monthlyMetrics && previousMonthMetrics 
    ? calculateChange(monthlyMetrics.newUsers, previousMonthMetrics.newUsers)
    : { change: "...", changeType: "neutral" as const };

  // Calculate yearly changes
  const yearlyOrgChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.organizations, previousYearMetrics.organizations)
    : { change: "...", changeType: "neutral" as const };

  const yearlyDonationChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.totalDonations, previousYearMetrics.totalDonations)
    : { change: "...", changeType: "neutral" as const };

  const yearlyEventChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.events, previousYearMetrics.events)
    : { change: "...", changeType: "neutral" as const };

  const hoursChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.hoursDonated, previousYearMetrics.hoursDonated)
    : { change: "...", changeType: "neutral" as const };

  const postsChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.posts, previousYearMetrics.posts)
    : { change: "...", changeType: "neutral" as const };

  const financialChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.financialTotals, previousYearMetrics.financialTotals)
    : { change: "...", changeType: "neutral" as const };

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
            {/* Add custom widgets for pending approvals */}
            {pendingApprovalsWidgets?.map((widget) => (
              <CustomWidget
                key={widget.id}
                title={widget.title}
                description={widget.description}
                metrics={widget.metrics}
                displayConfig={widget.display_config}
                section="pending_approvals"
              />
            ))}
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
            change={orgChange.change}
            changeType={orgChange.changeType}
            icon={Building2}
            navigateTo="/organizations"
          />
          <MetricCard
            title="Scholarships"
            value={monthlyLoading ? "..." : formatNumber(monthlyMetrics?.newScholarships || 0)}
            change={scholarshipChange.change}
            changeType={scholarshipChange.changeType}
            icon={GraduationCap}
            navigateTo="/scholarships"
          />
          <MetricCard
            title="Donations"
            value={monthlyLoading ? "..." : formatCurrency(monthlyMetrics?.totalDonations || 0)}
            change={monthlyDonationChange.change}
            changeType={monthlyDonationChange.changeType}
            icon={DollarSign}
            navigateTo="/donations"
          />
          <MetricCard
            title="Events"
            value={monthlyLoading ? "..." : formatNumber(monthlyMetrics?.newEvents || 0)}
            change={eventChange.change}
            changeType={eventChange.changeType}
            icon={Calendar}
            navigateTo="/events"
          />
          <MetricCard
            title="New Users"
            value={monthlyLoading ? "..." : formatNumber(monthlyMetrics?.newUsers || 0)}
            change={userChange.change}
            changeType={userChange.changeType}
            icon={Users}
            navigateTo="/users"
          />
          {/* Add custom widgets for monthly metrics */}
          {monthlyMetricsWidgets?.map((widget) => (
            <CustomWidget
              key={widget.id}
              title={widget.title}
              description={widget.description}
              metrics={widget.metrics}
              displayConfig={widget.display_config}
              section="monthly_metrics"
            />
          ))}
        </div>
      </div>

      {/* Year Metrics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Year Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Organizations"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.organizations || 0)}
            change={yearlyOrgChange.change}
            changeType={yearlyOrgChange.changeType}
            icon={Building2}
            navigateTo="/organizations"
          />
          <MetricCard
            title="Donations"
            value={yearlyLoading ? "..." : formatCurrency(yearlyMetrics?.totalDonations || 0)}
            change={yearlyDonationChange.change}
            changeType={yearlyDonationChange.changeType}
            icon={DollarSign}
            navigateTo="/donations"
          />
          <MetricCard
            title="Events"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.events || 0)}
            change={yearlyEventChange.change}
            changeType={yearlyEventChange.changeType}
            icon={Calendar}
            navigateTo="/events"
          />
          <MetricCard
            title="Hours Donated"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.hoursDonated || 0)}
            change={hoursChange.change}
            changeType={hoursChange.changeType}
            icon={Clock}
          />
          <MetricCard
            title="Posts"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.posts || 0)}
            change={postsChange.change}
            changeType={postsChange.changeType}
            icon={MessageSquare}
          />
          <MetricCard
            title="Financial Totals"
            value={yearlyLoading ? "..." : formatCurrency(yearlyMetrics?.financialTotals || 0)}
            change={financialChange.change}
            changeType={financialChange.changeType}
            icon={Calculator}
          />
          {/* Add custom widgets for yearly metrics */}
          {yearlyMetricsWidgets?.map((widget) => (
            <CustomWidget
              key={widget.id}
              title={widget.title}
              description={widget.description}
              metrics={widget.metrics}
              displayConfig={widget.display_config}
              section="yearly_metrics"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
