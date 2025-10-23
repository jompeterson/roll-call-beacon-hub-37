import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ActivityPost {
  id: string;
  type: 'donation' | 'request' | 'event' | 'volunteer';
  title: string;
  created_at: string;
  acceptances?: Array<{ user_id: string; created_at: string }>;
  fulfillments?: Array<{ user_id: string; created_at: string }>;
  rsvps?: Array<{ user_id: string; created_at: string; guest_info?: any }>;
  signups?: Array<{ user_id: string; created_at: string; guest_info?: any }>;
  comments?: Array<{ id: string; creator_user_id: string; content: string; created_at: string }>;
}

export const useUserActivity = () => {
  const { user } = useAuth();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return useQuery({
    queryKey: ["user-activity", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const activities: ActivityPost[] = [];

      // Fetch donations
      const { data: donations } = await supabase
        .from("donations")
        .select(`
          id,
          title,
          created_at
        `)
        .eq("creator_user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      // Fetch donation acceptances
      if (donations && donations.length > 0) {
        const donationIds = donations.map(d => d.id);
        const { data: acceptances } = await supabase
          .from("donation_acceptances")
          .select("donation_id, user_id, created_at")
          .in("donation_id", donationIds);

        const { data: donationComments } = await supabase
          .from("comments")
          .select("id, content_id, creator_user_id, content, created_at")
          .eq("content_type", "donation")
          .in("content_id", donationIds);

        donations.forEach(donation => {
          activities.push({
            id: donation.id,
            type: 'donation',
            title: donation.title,
            created_at: donation.created_at,
            acceptances: acceptances?.filter(a => a.donation_id === donation.id) || [],
            comments: donationComments?.filter(c => c.content_id === donation.id) || []
          });
        });
      }

      // Fetch requests
      const { data: requests } = await supabase
        .from("requests")
        .select(`
          id,
          title,
          created_at
        `)
        .eq("creator_user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      // Fetch request fulfillments
      if (requests && requests.length > 0) {
        const requestIds = requests.map(r => r.id);
        const { data: fulfillments } = await supabase
          .from("request_fulfillments")
          .select("request_id, user_id, created_at")
          .in("request_id", requestIds);

        const { data: requestComments } = await supabase
          .from("comments")
          .select("id, content_id, creator_user_id, content, created_at")
          .eq("content_type", "request")
          .in("content_id", requestIds);

        requests.forEach(request => {
          activities.push({
            id: request.id,
            type: 'request',
            title: request.title,
            created_at: request.created_at,
            fulfillments: fulfillments?.filter(f => f.request_id === request.id) || [],
            comments: requestComments?.filter(c => c.content_id === request.id) || []
          });
        });
      }

      // Fetch events
      const { data: events } = await supabase
        .from("events")
        .select(`
          id,
          title,
          created_at
        `)
        .eq("creator_user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      // Fetch event RSVPs
      if (events && events.length > 0) {
        const eventIds = events.map(e => e.id);
        const { data: rsvps } = await supabase
          .from("event_rsvps")
          .select("event_id, user_id, guest_info, created_at")
          .in("event_id", eventIds);

        const { data: eventComments } = await supabase
          .from("comments")
          .select("id, content_id, creator_user_id, content, created_at")
          .eq("content_type", "event")
          .in("content_id", eventIds);

        events.forEach(event => {
          activities.push({
            id: event.id,
            type: 'event',
            title: event.title,
            created_at: event.created_at,
            rsvps: rsvps?.filter(r => r.event_id === event.id) || [],
            comments: eventComments?.filter(c => c.content_id === event.id) || []
          });
        });
      }

      // Fetch volunteers
      const { data: volunteers } = await supabase
        .from("volunteers")
        .select(`
          id,
          title,
          created_at
        `)
        .eq("creator_user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      // Fetch volunteer signups
      if (volunteers && volunteers.length > 0) {
        const volunteerIds = volunteers.map(v => v.id);
        const { data: signups } = await supabase
          .from("volunteer_signups")
          .select("volunteer_id, user_id, guest_info, created_at")
          .in("volunteer_id", volunteerIds);

        const { data: volunteerComments } = await supabase
          .from("comments")
          .select("id, content_id, creator_user_id, content, created_at")
          .eq("content_type", "volunteer")
          .in("content_id", volunteerIds);

        volunteers.forEach(volunteer => {
          activities.push({
            id: volunteer.id,
            type: 'volunteer',
            title: volunteer.title,
            created_at: volunteer.created_at,
            signups: signups?.filter(s => s.volunteer_id === volunteer.id) || [],
            comments: volunteerComments?.filter(c => c.content_id === volunteer.id) || []
          });
        });
      }

      // Sort all activities by created_at
      return activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!user?.id,
  });
};
