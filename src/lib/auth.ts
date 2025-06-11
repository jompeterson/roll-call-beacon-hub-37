
import { customAuth } from "@/lib/customAuth";
import { RegistrationData } from "@/pages/Register";
import { supabase } from "@/integrations/supabase/client";

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

    // Get role_id from role name
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', registrationData.role)
      .single();

    if (roleError) {
      console.error('Role lookup error:', roleError);
      throw new Error('Invalid role specified');
    }

    // Sign up the user with our custom auth system
    const { user, error } = await customAuth.signUp(
      registrationData.email,
      registrationData.password,
      {
        email: registrationData.email,
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        address: registrationData.address,
        phone: registrationData.phone,
        role_id: roleData.id,
        organization_id: organizationId,
      }
    );

    if (error) {
      console.error('User creation error:', error);
      throw new Error(error);
    }

    if (!user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('User created successfully:', user.id);
    console.log('Profile data to insert:', {
      id: user.id,
      email: registrationData.email,
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      address: registrationData.address,
      phone: registrationData.phone,
      role_id: roleData.id,
      organization_id: organizationId,
    });

    return { data: { user }, error: null };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  const { user, error } = await customAuth.signIn(email, password);
  
  if (error) {
    return { data: null, error: new Error(error) };
  }
  
  if (user) {
    // Check if user is approved
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_approved')
      .eq('email', email)
      .single();
    
    if (profileError) {
      console.error('Profile check error:', profileError);
      return { data: { user }, error: null };
    }
    
    return { 
      data: { user, isApproved: profileData?.is_approved || false }, 
      error: null 
    };
  }
  
  return { data: null, error: new Error('Login failed') };
};

export const signOut = async () => {
  const { error } = await customAuth.signOut();
  return { error: error ? new Error(error) : null };
};

export const checkVerificationStatus = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_approved')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Verification status check error:', error);
      return { isApproved: false, error: error.message };
    }

    return { isApproved: data?.is_approved || false, error: null };
  } catch (error: any) {
    console.error('Verification status check error:', error);
    return { isApproved: false, error: 'Failed to check verification status' };
  }
};

export const getExistingOrganizations = async () => {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, type, description')
    .eq('is_approved', true)
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
