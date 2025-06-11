
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up real-time subscriptions for all tables
    const channels = [
      // Donations real-time subscription
      supabase
        .channel('donations-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'donations' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['donations'] });
            queryClient.invalidateQueries({ queryKey: ['pending-donations'] });
          }
        )
        .subscribe(),

      // Requests real-time subscription
      supabase
        .channel('requests-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'requests' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
          }
        )
        .subscribe(),

      // Scholarships real-time subscription
      supabase
        .channel('scholarships-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'scholarships' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
            queryClient.invalidateQueries({ queryKey: ['pending-scholarships'] });
          }
        )
        .subscribe(),

      // Events real-time subscription
      supabase
        .channel('events-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'events' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['pending-events'] });
          }
        )
        .subscribe(),

      // Organizations real-time subscription
      supabase
        .channel('organizations-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'organizations' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            queryClient.invalidateQueries({ queryKey: ['pending-organizations'] });
          }
        )
        .subscribe(),

      // User profiles real-time subscription
      supabase
        .channel('user-profiles-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'user_profiles' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
            queryClient.invalidateQueries({ queryKey: ['pending-users'] });
          }
        )
        .subscribe(),

      // Notifications real-time subscription
      supabase
        .channel('notifications-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        )
        .subscribe(),

      // Comments real-time subscription
      supabase
        .channel('comments-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'comments' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
          }
        )
        .subscribe(),

      // Event RSVPs real-time subscription
      supabase
        .channel('event-rsvps-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'event_rsvps' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['event-rsvps'] });
          }
        )
        .subscribe(),
    ];

    // Cleanup function to unsubscribe from all channels
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient]);
};
