
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { customAuth } from "@/lib/customAuth";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  max_participants: number | null;
  creator_user_id: string;
  is_approved: boolean;
  approval_decision_made: boolean;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load events.",
          variant: "destructive",
        });
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          is_approved: true, 
          approval_decision_made: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) {
        console.error('Error approving event:', error);
        toast({
          title: "Error",
          description: "Failed to approve event.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Event approved successfully.",
      });

      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error approving event:', error);
      toast({
        title: "Error",
        description: "Failed to approve event.",
        variant: "destructive",
      });
    }
  };

  const rejectEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          is_approved: false, 
          approval_decision_made: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) {
        console.error('Error rejecting event:', error);
        toast({
          title: "Error",
          description: "Failed to reject event.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Event rejected successfully.",
      });

      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast({
        title: "Error",
        description: "Failed to reject event.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    fetchEvents,
    approveEvent,
    rejectEvent
  };
};
