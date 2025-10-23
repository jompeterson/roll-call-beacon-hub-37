import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ActivityPost {
  id: string;
  type: 'donation' | 'request' | 'event' | 'volunteer';
  title: string;
  created_at: string;
  acceptances?: Array<{ user_id: string; created_at: string; user?: UserInfo }>;
  fulfillments?: Array<{ user_id: string; created_at: string; user?: UserInfo }>;
  rsvps?: Array<{ user_id: string; created_at: string; guest_info?: any; user?: UserInfo }>;
  signups?: Array<{ user_id: string; created_at: string; guest_info?: any; user?: UserInfo }>;
  comments?: Array<{ id: string; creator_user_id: string; content: string; created_at: string; user?: UserInfo }>;
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
      const userCache = new Map<string, UserInfo>();

      // Helper function to fetch user info
      const getUserInfo = async (userId: string): Promise<UserInfo | undefined> => {
        if (userCache.has(userId)) {
          return userCache.get(userId);
        }

        const { data } = await supabase
          .from("user_profiles")
          .select("id, first_name, last_name, email")
          .eq("id", userId)
          .single();

        if (data) {
          const userInfo: UserInfo = {
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email
          };
          userCache.set(userId, userInfo);
          return userInfo;
        }
        return undefined;
      };

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

        // Fetch user info for all interactions
        const allUserIds = new Set<string>();
        acceptances?.forEach(a => allUserIds.add(a.user_id));
        donationComments?.forEach(c => allUserIds.add(c.creator_user_id));

        await Promise.all(Array.from(allUserIds).map(id => getUserInfo(id)));

        donations.forEach(donation => {
          const donationAcceptances = acceptances?.filter(a => a.donation_id === donation.id).map(a => ({
            ...a,
            user: userCache.get(a.user_id)
          })) || [];

          const donationCommentsList = donationComments?.filter(c => c.content_id === donation.id).map(c => ({
            ...c,
            user: userCache.get(c.creator_user_id)
          })) || [];

          activities.push({
            id: donation.id,
            type: 'donation',
            title: donation.title,
            created_at: donation.created_at,
            acceptances: donationAcceptances,
            comments: donationCommentsList
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

        // Fetch user info for all interactions
        const allUserIds = new Set<string>();
        fulfillments?.forEach(f => allUserIds.add(f.user_id));
        requestComments?.forEach(c => allUserIds.add(c.creator_user_id));

        await Promise.all(Array.from(allUserIds).map(id => getUserInfo(id)));

        requests.forEach(request => {
          const requestFulfillments = fulfillments?.filter(f => f.request_id === request.id).map(f => ({
            ...f,
            user: userCache.get(f.user_id)
          })) || [];

          const requestCommentsList = requestComments?.filter(c => c.content_id === request.id).map(c => ({
            ...c,
            user: userCache.get(c.creator_user_id)
          })) || [];

          activities.push({
            id: request.id,
            type: 'request',
            title: request.title,
            created_at: request.created_at,
            fulfillments: requestFulfillments,
            comments: requestCommentsList
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

        // Fetch user info for all interactions
        const allUserIds = new Set<string>();
        rsvps?.forEach(r => { if (r.user_id) allUserIds.add(r.user_id); });
        eventComments?.forEach(c => allUserIds.add(c.creator_user_id));

        await Promise.all(Array.from(allUserIds).map(id => getUserInfo(id)));

        events.forEach(event => {
          const eventRsvps = rsvps?.filter(r => r.event_id === event.id).map(r => ({
            ...r,
            user: r.user_id ? userCache.get(r.user_id) : undefined
          })) || [];

          const eventCommentsList = eventComments?.filter(c => c.content_id === event.id).map(c => ({
            ...c,
            user: userCache.get(c.creator_user_id)
          })) || [];

          activities.push({
            id: event.id,
            type: 'event',
            title: event.title,
            created_at: event.created_at,
            rsvps: eventRsvps,
            comments: eventCommentsList
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

        // Fetch user info for all interactions
        const allUserIds = new Set<string>();
        signups?.forEach(s => { if (s.user_id) allUserIds.add(s.user_id); });
        volunteerComments?.forEach(c => allUserIds.add(c.creator_user_id));

        await Promise.all(Array.from(allUserIds).map(id => getUserInfo(id)));

        volunteers.forEach(volunteer => {
          const volunteerSignups = signups?.filter(s => s.volunteer_id === volunteer.id).map(s => ({
            ...s,
            user: s.user_id ? userCache.get(s.user_id) : undefined
          })) || [];

          const volunteerCommentsList = volunteerComments?.filter(c => c.content_id === volunteer.id).map(c => ({
            ...c,
            user: userCache.get(c.creator_user_id)
          })) || [];

          activities.push({
            id: volunteer.id,
            type: 'volunteer',
            title: volunteer.title,
            created_at: volunteer.created_at,
            signups: volunteerSignups,
            comments: volunteerCommentsList
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
