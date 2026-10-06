import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const yearStart = () => new Date(new Date().getFullYear(), 0, 1).toISOString();

export const EventRevenueWidget = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["event-revenue", new Date().getFullYear()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("funds_raised")
        .eq("is_ended", true)
        .not("funds_raised", "is", null)
        .gte("start_date", yearStart());
      if (error) throw error;
      return {
        total: (data || []).reduce((s, e: any) => s + Number(e.funds_raised || 0), 0),
        count: data?.length || 0,
      };
    },
  });

  if (!isLoading && (!data || data.total === 0)) return null;

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/events")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Event Revenue</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "..." : data!.total.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
        </div>
        <p className="text-xs text-muted-foreground">
          From {data?.count ?? 0} closed-out event{data?.count === 1 ? "" : "s"} this year
        </p>
      </CardContent>
    </Card>
  );
};

export const ProgramsSupportedWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["programs-supported", new Date().getFullYear()],
    queryFn: async () => {
      const { data: donations, error } = await supabase
        .from("donations")
        .select("selected_recipient_user_id")
        .eq("is_taken", true)
        .not("selected_recipient_user_id", "is", null)
        .gte("updated_at", yearStart());
      if (error) throw error;
      const ids = [...new Set((donations || []).map((d: any) => d.selected_recipient_user_id))];
      if (!ids.length) return [];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, first_name, last_name, organizations:organization_id(name)")
        .in("id", ids);
      const counts = new Map<string, number>();
      (donations || []).forEach((d: any) => {
        const p: any = profiles?.find((x: any) => x.id === d.selected_recipient_user_id);
        const name = p?.organizations?.name || (p ? `${p.first_name} ${p.last_name}` : null);
        if (name) counts.set(name, (counts.get(name) || 0) + 1);
      });
      return [...counts.entries()].sort((a, b) => b[1] - a[1]);
    },
  });

  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Programs Supported</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? "..." : data!.length}</div>
        <ul className="mt-2 max-h-32 overflow-y-auto flex flex-wrap gap-1.5">
          {data?.map(([name, n]) => (
            <li
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-xs font-medium max-w-full"
            >
              <span className="truncate">{name}</span>
              <span className="rounded-full bg-primary text-primary-foreground px-1.5 py-px text-[10px] font-semibold shrink-0">
                {n}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
