
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface RSVP {
  id: string;
  event_id: string;
  user_id: string;
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
      
      // Check if current user has RSVP'd
      if (user) {
        const currentUserRsvp = data?.find(rsvp => rsvp.user_id === user.id);
        setUserRsvp(currentUserRsvp || null);
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
    if (!user || !eventId) return;

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: eventId,
          user_id: user.id
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
    if (!user || !userRsvp) return;

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
    fetchRSVPs();

    // Set up real-time subscription for RSVPs
    const channel = supabase
      .channel(`event-rsvps-${eventId}`)
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
      supabase.removeChannel(channel);
    };
  }, [eventId, user]);

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
