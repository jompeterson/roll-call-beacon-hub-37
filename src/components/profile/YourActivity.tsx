import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserActivity, ActivityPost } from "@/hooks/useUserActivity";
import { MessageSquare, Users, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const getUserName = (user: { first_name: string; last_name: string } | undefined, guestInfo?: any) => {
    if (user) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (guestInfo) {
      return guestInfo.name || 'Guest';
    }
    return 'Unknown User';
  };

  const hasActivity = 
    (activity.acceptances && activity.acceptances.length > 0) ||
    (activity.fulfillments && activity.fulfillments.length > 0) ||
    (activity.rsvps && activity.rsvps.length > 0) ||
    (activity.signups && activity.signups.length > 0) ||
    (activity.comments && activity.comments.length > 0);

  return (
    <div className="rounded-lg border bg-card">
      <Accordion type="single" collapsible>
        <AccordionItem value="activity" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
            <div className="flex items-start justify-between gap-4 w-full pr-2">
              <div className="flex-1 min-w-0 text-left">
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
                <h4 className="font-medium text-sm mb-1">{activity.title}</h4>
                
                {hasActivity ? (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {activity.acceptances && activity.acceptances.length > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>{activity.acceptances.length} {activity.acceptances.length === 1 ? 'acceptance' : 'acceptances'}</span>
                      </div>
                    )}
                    {activity.fulfillments && activity.fulfillments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>{activity.fulfillments.length} {activity.fulfillments.length === 1 ? 'fulfillment' : 'fulfillments'}</span>
                      </div>
                    )}
                    {activity.rsvps && activity.rsvps.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{activity.rsvps.length} {activity.rsvps.length === 1 ? 'RSVP' : 'RSVPs'}</span>
                      </div>
                    )}
                    {activity.signups && activity.signups.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{activity.signups.length} {activity.signups.length === 1 ? 'signup' : 'signups'}</span>
                      </div>
                    )}
                    {activity.comments && activity.comments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{activity.comments.length} {activity.comments.length === 1 ? 'comment' : 'comments'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-3 pt-2">
              {activity.acceptances && activity.acceptances.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Acceptances
                  </h5>
                  <ul className="space-y-1 ml-4">
                    {activity.acceptances.map((acceptance, idx) => (
                      <li key={idx} className="text-xs">
                        {getUserName(acceptance.user)} - {new Date(acceptance.created_at).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activity.fulfillments && activity.fulfillments.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Fulfillments
                  </h5>
                  <ul className="space-y-1 ml-4">
                    {activity.fulfillments.map((fulfillment, idx) => (
                      <li key={idx} className="text-xs">
                        {getUserName(fulfillment.user)} - {new Date(fulfillment.created_at).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activity.rsvps && activity.rsvps.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Users className="h-3 w-3" /> RSVPs
                  </h5>
                  <ul className="space-y-1 ml-4">
                    {activity.rsvps.map((rsvp, idx) => (
                      <li key={idx} className="text-xs">
                        {getUserName(rsvp.user, rsvp.guest_info)} - {new Date(rsvp.created_at).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activity.signups && activity.signups.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Signups
                  </h5>
                  <ul className="space-y-1 ml-4">
                    {activity.signups.map((signup, idx) => (
                      <li key={idx} className="text-xs">
                        {getUserName(signup.user, signup.guest_info)} - {new Date(signup.created_at).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activity.comments && activity.comments.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Comments
                  </h5>
                  <ul className="space-y-1 ml-4">
                    {activity.comments.map((comment) => (
                      <li key={comment.id} className="text-xs">
                        <span className="font-medium">{getUserName(comment.user)}:</span>{' '}
                        <span className="text-muted-foreground">{comment.content.substring(0, 50)}{comment.content.length > 50 ? '...' : ''}</span>
                        {' - '}{new Date(comment.created_at).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link 
                to={getActivityLink()} 
                className="inline-flex items-center text-xs text-primary hover:underline mt-2"
              >
                View full post →
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
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
