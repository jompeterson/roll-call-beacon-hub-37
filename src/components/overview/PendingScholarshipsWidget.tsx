
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap } from "lucide-react";
import { useScholarships } from "@/hooks/useScholarships";
import { ScholarshipModal } from "@/components/ScholarshipModal";

export const PendingScholarshipsWidget = () => {
  const { scholarships, approveScholarship, rejectScholarship, requestChanges } = useScholarships();
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const pendingScholarships = scholarships.filter(scholarship => !scholarship.approval_decision_made);

  const handleScholarshipClick = (scholarship: any) => {
    setSelectedScholarship(scholarship);
    setModalOpen(true);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Card className="cursor-pointer" onClick={() => {}}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Scholarships</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{pendingScholarships.length}</div>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {pendingScholarships.slice(0, 5).map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="text-xs p-2 rounded bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScholarshipClick(scholarship);
                  }}
                >
                  <div className="font-medium truncate">{scholarship.title}</div>
                  <div className="text-muted-foreground truncate">
                    {formatAmount(scholarship.amount)}
                  </div>
                </div>
              ))}
              {pendingScholarships.length > 5 && (
                <div className="text-xs text-muted-foreground text-center p-1">
                  +{pendingScholarships.length - 5} more...
                </div>
              )}
            </div>
          </ScrollArea>
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
