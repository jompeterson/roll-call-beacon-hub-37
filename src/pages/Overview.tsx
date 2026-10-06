
import { MetricCard } from "@/components/MetricCard";
import { PendingOrganizationsWidget } from "@/components/PendingOrganizationsWidget";
import { PendingUsersWidget } from "@/components/PendingUsersWidget";
import { PendingScholarshipsWidget } from "@/components/PendingScholarshipsWidget";
import { PendingDonationsRequestsWidget } from "@/components/PendingDonationsRequestsWidget";
import { PendingEventsWidget } from "@/components/PendingEventsWidget";
import { CustomWidget } from "@/components/CustomWidget";
import { useAuth } from "@/hooks/useAuth";
import { useYearlyMetrics } from "@/hooks/useYearlyMetrics";
import { usePreviousYearMetrics } from "@/hooks/usePreviousYearMetrics";
import { useMetricChanges } from "@/hooks/useMetricChanges";
import { useCustomWidgets } from "@/hooks/useCustomWidgets";
import {
  Hammer,
  Calendar,
  Building2,
  Clock,
  MessageSquare,
  Calculator,
  HandHeart,
  DollarSign,
} from "lucide-react";

export const Overview = () => {
  const { isAdministrator } = useAuth();
  const { data: yearlyMetrics, isLoading: yearlyLoading } = useYearlyMetrics();
  const { data: previousYearMetrics, isLoading: previousYearLoading } = usePreviousYearMetrics();
  const { calculateChange } = useMetricChanges();
  
  // Fetch custom widgets for each section
  const { data: pendingApprovalsWidgets } = useCustomWidgets('pending_approvals');
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

  // Calculate yearly changes
  const yearlyOrgChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.organizations, previousYearMetrics.organizations)
    : { change: "...", changeType: "neutral" as const };

  const yearlyDonationChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.totalDonations, previousYearMetrics.totalDonations)
    : { change: "...", changeType: "neutral" as const };

  const yearlyPendingDonationChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.pendingDonations, previousYearMetrics.pendingDonations)
    : { change: "...", changeType: "neutral" as const };

  const yearlyEventChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.events, previousYearMetrics.events)
    : { change: "...", changeType: "neutral" as const };

  const hoursChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.hoursDonated, previousYearMetrics.hoursDonated)
    : { change: "...", changeType: "neutral" as const };

  const hoursValueChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.hoursDonatedValue, previousYearMetrics.hoursDonatedValue)
    : { change: "...", changeType: "neutral" as const };

  const postsChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.posts, previousYearMetrics.posts)
    : { change: "...", changeType: "neutral" as const };

  const financialChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.financialTotals, previousYearMetrics.financialTotals)
    : { change: "...", changeType: "neutral" as const };

  const yearlyVolunteerChange = !yearlyLoading && !previousYearLoading && yearlyMetrics && previousYearMetrics 
    ? calculateChange(yearlyMetrics.volunteers, previousYearMetrics.volunteers)
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
            <PendingUsersWidget />
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

      {/* Year Metrics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Year Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Organizations"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.organizations || 0)}
            rawValue={yearlyMetrics?.organizations || 0}
            isLoading={yearlyLoading}
            change={yearlyOrgChange.change}
            changeType={yearlyOrgChange.changeType}
            icon={Building2}
            navigateTo="/organizations"
          />
          <MetricCard
            title="In-Kind Donations"
            value={yearlyLoading ? "..." : formatCurrency(yearlyMetrics?.totalDonations || 0)}
            rawValue={yearlyMetrics?.totalDonations || 0}
            isLoading={yearlyLoading}
            change={yearlyDonationChange.change}
            changeType={yearlyDonationChange.changeType}
            icon={Hammer}
            navigateTo="/donations"
          />
          <MetricCard
            title="Available In-Kind Donations"
            value={yearlyLoading ? "..." : formatCurrency(yearlyMetrics?.pendingDonations || 0)}
            rawValue={yearlyMetrics?.pendingDonations || 0}
            isLoading={yearlyLoading}
            change={yearlyPendingDonationChange.change}
            changeType={yearlyPendingDonationChange.changeType}
            icon={Hammer}
            navigateTo="/donations"
          />
          <MetricCard
            title="Events"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.events || 0)}
            rawValue={yearlyMetrics?.events || 0}
            isLoading={yearlyLoading}
            change={yearlyEventChange.change}
            changeType={yearlyEventChange.changeType}
            icon={Calendar}
            navigateTo="/events"
          />
          <MetricCard
            title="Hours Donated"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.hoursDonated || 0)}
            rawValue={yearlyMetrics?.hoursDonated || 0}
            isLoading={yearlyLoading}
            change={hoursChange.change}
            changeType={hoursChange.changeType}
            icon={Clock}
          />
          <MetricCard
            title="Estimated Value of Hours Donated"
            value={yearlyLoading ? "..." : formatCurrency(yearlyMetrics?.hoursDonatedValue || 0)}
            rawValue={yearlyMetrics?.hoursDonatedValue || 0}
            isLoading={yearlyLoading}
            change={hoursValueChange.change}
            changeType={hoursValueChange.changeType}
            icon={DollarSign}
          />
          <MetricCard
            title="Posts"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.posts || 0)}
            rawValue={yearlyMetrics?.posts || 0}
            isLoading={yearlyLoading}
            change={postsChange.change}
            changeType={postsChange.changeType}
            icon={MessageSquare}
          />
          <MetricCard
            title="Financial Totals"
            value={yearlyLoading ? "..." : formatCurrency(yearlyMetrics?.financialTotals || 0)}
            rawValue={yearlyMetrics?.financialTotals || 0}
            isLoading={yearlyLoading}
            change={financialChange.change}
            changeType={financialChange.changeType}
            icon={Calculator}
          />
          <MetricCard
            title="Volunteer Opportunities"
            value={yearlyLoading ? "..." : formatNumber(yearlyMetrics?.volunteers || 0)}
            rawValue={yearlyMetrics?.volunteers || 0}
            isLoading={yearlyLoading}
            change={yearlyVolunteerChange.change}
            changeType={yearlyVolunteerChange.changeType}
            icon={HandHeart}
            navigateTo="/volunteers"
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
