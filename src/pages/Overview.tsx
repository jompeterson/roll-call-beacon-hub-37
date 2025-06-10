
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  GraduationCap,
  Calendar,
  Building2,
  TrendingUp,
} from "lucide-react";

export const Overview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Welcome to your Roll Call dashboard
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Users"
          value="2,847"
          change="+12.5%"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Total Donations"
          value="$45,678"
          change="+8.2%"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Active Scholarships"
          value="23"
          change="+2"
          changeType="positive"
          icon={GraduationCap}
        />
        <MetricCard
          title="Upcoming Events"
          value="12"
          change="+3"
          changeType="positive"
          icon={Calendar}
        />
        <MetricCard
          title="Partner Organizations"
          value="156"
          change="+7.1%"
          changeType="positive"
          icon={Building2}
        />
        <MetricCard
          title="Growth Rate"
          value="24.8%"
          change="+4.2%"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Additional Widgets */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New scholarship application received</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Event registration opened</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New organization partnership</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Applications Pending</span>
                <span className="text-sm font-medium">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Events This Month</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Members</span>
                <span className="text-sm font-medium">124</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Response Rate</span>
                <span className="text-sm font-medium">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
