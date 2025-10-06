import { useParams, useNavigate, Link } from "react-router-dom";
import { useRequests, type Request } from "@/hooks/useRequests";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { RequestModalCreatorInfo } from "@/components/request/RequestModalCreatorInfo";
import { RequestModalInformation } from "@/components/request/RequestModalInformation";
import { RequestModalImageSection } from "@/components/request/RequestModalImageSection";
import { RequestModalActionButtons } from "@/components/request/RequestModalActionButtons";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ShareButton } from "@/components/ShareButton";

export const RequestDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdministrator } = useAuth();
  const { data: requests = [], isLoading } = useRequests();

  const request = requests.find(r => r.id === requestId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/donations">Donations</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Loading...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-center h-64">
          <p>Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/donations">Donations</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Not Found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg mb-4">Request not found</p>
            <Button onClick={() => navigate('/donations')}>Back to Donations</Button>
          </div>
        </div>
      </div>
    );
  }

  const orgName = request.organization_name || "Unknown Organization";

  const handleApprove = (id: string) => {
    console.log("Approved request:", id);
  };

  const handleReject = (id: string) => {
    console.log("Rejected request:", id);
  };

  const handleRequestChanges = (id: string) => {
    console.log("Requested changes for request:", id);
  };

  const showComments = request.is_approved;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/donations">Donations</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{request.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Content Card */}
      <div className="bg-card rounded-lg border">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{request.title}</h1>
                {isAdministrator && request.is_completed && (
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Completed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Request a Donation</p>
            </div>
            <ShareButton />
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="p-6 space-y-6">
            <RequestModalCreatorInfo
              creatorInfo={{
                name: "User Name",
                email: "user@example.com",
                organization: orgName
              }}
              createdAt={request.created_at}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RequestModalInformation request={request} />
              <RequestModalImageSection title={request.title} />
            </div>

            {/* Comments Section */}
            {showComments && (
              <CommentsSection
                contentType="request"
                contentId={request.id}
                title="Request Discussion"
              />
            )}
          </div>
        </ScrollArea>

        {/* Footer with Action Buttons */}
        {isAuthenticated && !request.is_completed && (
          <RequestModalActionButtons
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestChanges={handleRequestChanges}
            onOpenChange={() => navigate('/donations')}
          />
        )}
      </div>
    </div>
  );
};
