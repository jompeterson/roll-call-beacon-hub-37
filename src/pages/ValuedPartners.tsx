import poweredByLogo from "@/assets/powered-by-pacific-crest.png";

export const ValuedPartners = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Valued Partners</h1>
          <p className="text-muted-foreground">
            Our trusted partners and collaborators
          </p>
        </div>
        <img
          src={poweredByLogo}
          alt="Platform Powered by Pacific Crest Custom Cabinetry"
          className="h-16 md:h-20 object-contain shrink-0"
        />
      </div>
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <p className="text-lg text-muted-foreground">Valued Partners page coming soon...</p>
      </div>
    </div>
  );
};
