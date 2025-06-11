
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PendingOrganizationsWidget } from "@/components/PendingOrganizationsWidget";
import { PendingScholarshipsWidget } from "@/components/PendingScholarshipsWidget";
import { PendingDonationsRequestsWidget } from "@/components/PendingDonationsRequestsWidget";
import { useAuth } from "@/hooks/useAuth";
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* This Month's Metrics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">This Month's Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="New Organizations"
            value="15"
            change="+3"
            changeType="positive"
            icon={Building2}
          />
          <MetricCard
            title="Scholarships"
            value="8"
            change="+2"
            changeType="positive"
            icon={GraduationCap}
          />
          <MetricCard
            title="Donations"
            value="$12,450"
            change="+18.5%"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Events"
            value="6"
            change="+1"
            changeType="positive"
            icon={Calendar}
          />
          <MetricCard
            title="New Users"
            value="124"
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
            value="156"
            change="+32.1%"
            changeType="positive"
            icon={Building2}
          />
          <MetricCard
            title="Donations"
            value="$245,678"
            change="+28.5%"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Events"
            value="48"
            change="+15.2%"
            changeType="positive"
            icon={Calendar}
          />
          <MetricCard
            title="Hours Donated"
            value="2,847"
            change="+41.3%"
            changeType="positive"
            icon={Clock}
          />
          <MetricCard
            title="Posts"
            value="1,234"
            change="+19.7%"
            changeType="positive"
            icon={MessageSquare}
          />
          <MetricCard
            title="Financial Totals"
            value="$425,890"
            change="+24.8%"
            changeType="positive"
            icon={Calculator}
          />
        </div>
      </div>
    </div>
  );
};
