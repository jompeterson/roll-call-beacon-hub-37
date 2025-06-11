
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Phone, Mail, ExternalLink } from "lucide-react";
import { useDonations } from "@/hooks/useDonations";
import { format } from "date-fns";

const Donations = () => {
  const { data: donations, isLoading, error } = useDonations();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-pink-600" />
          <h1 className="text-3xl font-bold">Donations</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-pink-600" />
          <h1 className="text-3xl font-bold">Donations</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Failed to load donations. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, needed: number) => {
    return Math.min((raised / needed) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Heart className="h-8 w-8 text-pink-600" />
        <h1 className="text-3xl font-bold">Donations</h1>
      </div>

      {donations && donations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No donations available at the moment. Check back later or create a new donation request.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {donations?.map((donation) => (
            <Card key={donation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{donation.title}</CardTitle>
                    {donation.organization_name && (
                      <CardDescription className="mt-1">
                        by {donation.organization_name}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                    <Heart className="h-3 w-3 mr-1" />
                    Donation
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {donation.description && (
                  <p className="text-muted-foreground">{donation.description}</p>
                )}

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {formatCurrency(donation.amount_raised || 0)} raised</span>
                    <span>Goal: {formatCurrency(donation.amount_needed)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${getProgressPercentage(donation.amount_raised || 0, donation.amount_needed)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getProgressPercentage(donation.amount_raised || 0, donation.amount_needed).toFixed(1)}% completed
                  </p>
                </div>

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {donation.target_date && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Target: {format(new Date(donation.target_date), "MMM d, yyyy")}
                    </div>
                  )}
                  
                  {donation.contact_email && (
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {donation.contact_email}
                    </div>
                  )}
                  
                  {donation.contact_phone && (
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {donation.contact_phone}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {donation.donation_link && (
                  <div className="flex justify-end">
                    <Button asChild className="bg-pink-600 hover:bg-pink-700">
                      <a 
                        href={donation.donation_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Donate Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Posted on {format(new Date(donation.created_at), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Donations;
