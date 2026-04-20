import pacificCrestLogo from "@/assets/pacific-crest-cabinetry.png";

export const ValuedPartners = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Valued Partners</h1>
        <p className="text-muted-foreground">
          Our trusted partners and collaborators
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="https://www.pacificcrestcabinetry.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center rounded-lg border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
        >
          <img
            src={pacificCrestLogo}
            alt="Platform Powered by Pacific Crest Custom Cabinetry"
            className="max-h-32 w-full object-contain"
          />
        </a>
      </div>
    </div>
  );
};
