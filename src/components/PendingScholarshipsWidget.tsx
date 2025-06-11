
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useScholarships } from "@/hooks/useScholarships";
import { ScholarshipModal } from "@/components/ScholarshipModal";
import { useState } from "react";
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

export const PendingScholarshipsWidget = () => {
  const { scholarships, isLoading, approveScholarship, rejectScholarship, requestChanges } = useScholarships();
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const pendingScholarships = scholarships.filter(scholarship => !scholarship.approval_decision_made);

  const handleScholarshipClick = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Scholarships</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Scholarships</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {pendingScholarships.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending scholarships</div>
          ) : (
            <div className="space-y-2">
              {pendingScholarships.map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleScholarshipClick(scholarship)}
                >
                  <div className="font-medium text-sm">{scholarship.title}</div>
                  <div className="text-xs text-muted-foreground">${scholarship.amount}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ScholarshipModal
        scholarship={selectedScholarship}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onApprove={approveScholarship}
        onReject={rejectScholarship}
        onRequestChanges={requestChanges}
      />
    </>
  );
};
