
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScholarshipModal } from "@/components/ScholarshipModal";
import { useScholarships } from "@/hooks/useScholarships";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Scholarship = Tables<"scholarships"> & {
  creator?: {
    email: string;
  };
  organization?: {
    id: string;
    name: string;
    type: string;
  };
};

export const Scholarships = () => {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [scholarshipModalOpen, setScholarshipModalOpen] = useState(false);
  
  const { scholarships, isLoading, error } = useScholarships();
  const { isAdministrator } = useAuth();

  // Handle URL parameter to open specific scholarship modal
  useEffect(() => {
    const fetchAndOpenScholarship = async () => {
      if (scholarshipId) {
        // First try to find in current list
        const scholarship = scholarships.find(s => s.id === scholarshipId);
        if (scholarship) {
          setSelectedScholarship(scholarship as Scholarship);
          setScholarshipModalOpen(true);
        } else if (scholarships.length > 0) {
          // If not found in list but we have scholarships loaded, try database
          try {
            const { data, error } = await supabase
              .from('scholarships')
              .select(`
                *,
                creator:users!scholarships_creator_user_id_fkey(email),
                organization:organizations(id, name, type)
              `)
              .eq('id', scholarshipId)
              .single();
            
            if (!error && data) {
              setSelectedScholarship(data as Scholarship);
              setScholarshipModalOpen(true);
            }
          } catch (error) {
            console.error('Error fetching scholarship:', error);
          }
        }
      }
    };

    fetchAndOpenScholarship();
  }, [scholarshipId, scholarships]);

  // Handle modal close and update URL
  const handleScholarshipModalClose = (open: boolean) => {
    setScholarshipModalOpen(open);
    if (!open) {
      setSelectedScholarship(null);
      if (scholarshipId) {
        navigate('/scholarships', { replace: true });
      }
    }
  };

  const handleScholarshipRowClick = (scholarship: any) => {
    setSelectedScholarship(scholarship as Scholarship);
    setScholarshipModalOpen(true);
    navigate(`/scholarships/${scholarship.id}`);
  };

  const handleScholarshipApprove = (id: string) => {
    console.log("Approved scholarship:", id);
    setScholarshipModalOpen(false);
    if (scholarshipId) {
      navigate('/scholarships', { replace: true });
    }
  };

  const handleScholarshipReject = (id: string) => {
    console.log("Rejected scholarship:", id);
    setScholarshipModalOpen(false);
    if (scholarshipId) {
      navigate('/scholarships', { replace: true });
    }
  };

  const handleScholarshipRequestChanges = (id: string) => {
    console.log("Requested changes for scholarship:", id);
    setScholarshipModalOpen(false);
    if (scholarshipId) {
      navigate('/scholarships', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scholarships</h1>
          <p className="text-muted-foreground">
            Manage and track scholarship opportunities
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Loading scholarships...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scholarships</h1>
          <p className="text-muted-foreground">
            Manage and track scholarship opportunities
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">Error loading scholarships: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scholarships</h1>
        <p className="text-muted-foreground">
          Manage and track scholarship opportunities
        </p>
      </div>

      <div className="grid gap-4">
        {scholarships.map((scholarship) => (
          <div
            key={scholarship.id}
            className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
            onClick={() => handleScholarshipRowClick(scholarship)}
          >
            <h3 className="font-semibold">{scholarship.title}</h3>
            <p className="text-sm text-muted-foreground">{scholarship.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Amount: ${scholarship.amount} | Deadline: {new Date(scholarship.application_deadline || '').toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      <ScholarshipModal
        scholarship={selectedScholarship}
        open={scholarshipModalOpen}
        onOpenChange={handleScholarshipModalClose}
        onApprove={handleScholarshipApprove}
        onReject={handleScholarshipReject}
        onRequestChanges={handleScholarshipRequestChanges}
      />
    </div>
  );
};
