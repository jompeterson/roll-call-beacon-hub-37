
import { supabase } from "@/integrations/supabase/client";
import { RegistrationData } from "@/pages/Register";

export const signUp = async (registrationData: RegistrationData) => {
  try {
    // Create organization first if it's a new organization
    let organizationId = registrationData.existingOrganizationId;
    
    if (registrationData.organizationChoice === 'new' && registrationData.newOrganization) {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: registrationData.newOrganization.name,
          type: registrationData.newOrganization.type as any,
          description: registrationData.newOrganization.description,
          address: registrationData.newOrganization.address,
          phone: registrationData.newOrganization.phone,
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw new Error('Failed to create organization');
      }
      
      organizationId = orgData.id;
    }

    // Sign up the user with metadata
    const { data, error } = await supabase.auth.signUp({
      email: registrationData.email,
      password: registrationData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          address: registrationData.address,
          phone: registrationData.phone,
          role: registrationData.role,
          organization_id: organizationId,
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    // If organization was created and user signup successful, link them
    if (organizationId && data.user) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ organization_id: organizationId })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        // Don't throw here as the user is already created
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getExistingOrganizations = async () => {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, type, description')
    .order('name');

  return { data, error };
};

export const getUserRoles = async () => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id, name, display_name, description')
    .order('name');

  return { data, error };
};
