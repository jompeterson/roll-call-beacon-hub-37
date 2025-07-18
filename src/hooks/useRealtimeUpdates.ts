
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Create a unique instance identifier to avoid conflicts
    const instanceId = `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    
    // Set up real-time subscriptions for all tables with unique channel names
    const channels = [
      // Donations real-time subscription
      supabase
        .channel(`donations-changes-${instanceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'donations' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['donations'] });
            queryClient.invalidateQueries({ queryKey: ['pending-donations'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['yearly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['previous-monthly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['previous-yearly-metrics'] });
          }
        ),

      // Requests real-time subscription
      supabase
        .channel(`requests-changes-${instanceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'requests' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
          }
        ),

      // Scholarships real-time subscription
      supabase
        .channel(`scholarships-changes-${instanceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'scholarships' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
            queryClient.invalidateQueries({ queryKey: ['pending-scholarships'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['previous-monthly-metrics'] });
          }
        ),

      // Events real-time subscription
      supabase
        .channel(`events-changes-${instanceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'events' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['pending-events'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['yearly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['previous-monthly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['previous-yearly-metrics'] });
          }
        ),

      // Organizations real-time subscription
      supabase
        .channel(`organizations-changes-${instanceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'organizations' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            queryClient.invalidateQueries({ queryKey: ['pending-organizations'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['yearly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['previous-monthly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['previous-yearly-metrics'] });
          }
        ),

      // User profiles real-time subscription
      supabase
        .channel(`user-profiles-changes-${instanceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'user_profiles' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
            queryClient.invalidateQueries({ queryKey: ['pending-users'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['previous-monthly-metrics'] });
          }
        ),

      // Notifications real-time subscription
      supabase
        .channel(`notifications-changes-${instanceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        ),

      // Comments real-time subscription
      supabase
        .channel(`comments-changes-${instanceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'comments' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            queryClient.invalidateQueries({ queryKey: ['yearly-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['previous-yearly-metrics'] });
          }
        ),

      // Event RSVPs real-time subscription
      supabase
        .channel(`event-rsvps-changes-${instanceId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'event_rsvps' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['event-rsvps'] });
          }
        ),
    ];

    // Subscribe to all channels
    channels.forEach(channel => channel.subscribe());

    // Cleanup function to unsubscribe from all channels
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient]);
};
