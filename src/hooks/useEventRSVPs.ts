
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface RSVP {
  id: string;
  event_id: string;
  user_id: string | null;
  guest_info: any | null;
  created_at: string;
  updated_at: string;
}

export const useEventRSVPs = (eventId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [userRsvp, setUserRsvp] = useState<RSVP | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const channelRef = useRef<any>(null);
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  const fetchRSVPs = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching RSVPs:', error);
        toast({
          title: "Error",
          description: "Failed to load RSVPs.",
          variant: "destructive",
        });
        return;
      }

      setRsvps(data || []);
      
      // Check if current user has RSVP'd (only for authenticated users)
      if (user?.id) {
        const currentUserRsvp = data?.find(rsvp => rsvp.user_id === user.id);
        setUserRsvp(currentUserRsvp || null);
      } else {
        setUserRsvp(null);
      }
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      toast({
        title: "Error",
        description: "Failed to load RSVPs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRSVP = async () => {
    if (!user?.id || !eventId) {
      console.error('User not authenticated or event ID missing');
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: eventId,
          user_id: user.id,
          guest_info: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating RSVP:', error);
        toast({
          title: "Error",
          description: "Failed to RSVP to event.",
          variant: "destructive",
        });
        return;
      }

      setUserRsvp(data);
      toast({
        title: "Success",
        description: "Successfully RSVP'd to event!",
      });
    } catch (error) {
      console.error('Error creating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to RSVP to event.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRSVP = async () => {
    if (!user?.id || !userRsvp) {
      console.error('User not authenticated or no RSVP to delete');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('id', userRsvp.id);

      if (error) {
        console.error('Error deleting RSVP:', error);
        toast({
          title: "Error",
          description: "Failed to cancel RSVP.",
          variant: "destructive",
        });
        return;
      }

      setUserRsvp(null);
      toast({
        title: "Success",
        description: "RSVP cancelled successfully.",
      });
    } catch (error) {
      console.error('Error deleting RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to cancel RSVP.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!eventId) return;

    fetchRSVPs();

    // Create new channel for real-time subscription with unique name
    const channelName = `event-rsvps-${eventId}-${instanceId.current}`;
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_rsvps',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          fetchRSVPs(); // Refetch RSVPs when any change occurs
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [eventId, user?.id]); // Only depend on eventId and user.id

  return {
    rsvps,
    userRsvp,
    rsvpCount: rsvps.length,
    hasRsvp: !!userRsvp,
    loading,
    submitting,
    createRSVP,
    deleteRSVP,
    fetchRSVPs
  };
};
