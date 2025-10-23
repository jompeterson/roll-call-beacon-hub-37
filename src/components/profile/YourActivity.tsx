import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserActivity, ActivityPost } from "@/hooks/useUserActivity";
import { MessageSquare, Users, CheckCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const ActivityItem = ({ activity }: { activity: ActivityPost }) => {
  const getActivityLink = () => {
    switch (activity.type) {
      case 'donation':
        return `/donations/${activity.id}`;
      case 'request':
        return `/requests/${activity.id}`;
      case 'event':
        return `/events/${activity.id}`;
      case 'volunteer':
        return `/volunteers/${activity.id}`;
      default:
        return '#';
    }
  };

  const getActivityStats = () => {
    const stats = [];
    
    if (activity.acceptances && activity.acceptances.length > 0) {
      stats.push({
        icon: CheckCircle,
        count: activity.acceptances.length,
        label: activity.acceptances.length === 1 ? 'acceptance' : 'acceptances'
      });
    }
    
    if (activity.fulfillments && activity.fulfillments.length > 0) {
      stats.push({
        icon: CheckCircle,
        count: activity.fulfillments.length,
        label: activity.fulfillments.length === 1 ? 'fulfillment' : 'fulfillments'
      });
    }
    
    if (activity.rsvps && activity.rsvps.length > 0) {
      stats.push({
        icon: Users,
        count: activity.rsvps.length,
        label: activity.rsvps.length === 1 ? 'RSVP' : 'RSVPs'
      });
    }
    
    if (activity.signups && activity.signups.length > 0) {
      stats.push({
        icon: Users,
        count: activity.signups.length,
        label: activity.signups.length === 1 ? 'signup' : 'signups'
      });
    }
    
    if (activity.comments && activity.comments.length > 0) {
      stats.push({
        icon: MessageSquare,
        count: activity.comments.length,
        label: activity.comments.length === 1 ? 'comment' : 'comments'
      });
    }
    
    return stats;
  };

  const stats = getActivityStats();
  const hasActivity = stats.length > 0;

  return (
    <Link 
      to={getActivityLink()} 
      className="block p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="capitalize">
              {activity.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(activity.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <h4 className="font-medium text-sm mb-2 truncate">{activity.title}</h4>
          
          {hasActivity ? (
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1">
                  <stat.icon className="h-3 w-3" />
                  <span>{stat.count} {stat.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No activity yet</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export const YourActivity = () => {
  const { data: activities, isLoading } = useUserActivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No posts created in the last 30 days.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your posts from the last 30 days
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map((activity) => (
            <ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
