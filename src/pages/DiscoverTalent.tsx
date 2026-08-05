import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Briefcase } from "lucide-react";
import {
  StudentTalentCard,
  StudentRow,
  getProfile,
  getCourses,
  getCerts,
} from "@/components/talent/StudentTalentCard";

interface B2SClassRow {
  id: string;
  name: string;
  year: number;
  session: string;
  sort_order: number;
}

export const DiscoverTalent = () => {
  const { isAuthenticated, userRole, isInitialized } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<B2SClassRow[]>([]);
  const [memberships, setMemberships] = useState<
    { class_id: string; student_user_id: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isStudent = userRole?.name === "student";
  const allowed = isAuthenticated && !isStudent;

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const [studentsRes, classesRes, membershipsRes] = await Promise.all([
        supabase
          .from("user_profiles")
          .select(`
            id, first_name, last_name, email, phone, profile_image_url, organization_id,
            organizations:organization_id ( name ),
            user_roles!inner ( name ),
            student_profiles ( bio, skills, resume_url, resume_filename ),
            student_courses ( course_name, completed_on ),
            student_certifications ( name, issuer )
          `)
          .eq("user_roles.name", "student")
          .eq("is_approved", true),
        supabase
          .from("b2s_classes")
          .select("id, name, year, session, sort_order")
          .order("sort_order", { ascending: true }),
        supabase.from("b2s_class_students").select("class_id, student_user_id"),
      ]);

      if (studentsRes.error) console.error("Error fetching students:", studentsRes.error);
      else setStudents((studentsRes.data as any) || []);

      if (classesRes.error) console.error("Error fetching classes:", classesRes.error);
      else setClasses((classesRes.data as any) || []);

      if (membershipsRes.error)
        console.error("Error fetching class rosters:", membershipsRes.error);
      else setMemberships((membershipsRes.data as any) || []);

      setLoading(false);
    };
    fetchData();
  }, [allowed]);

  if (!isInitialized) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!allowed) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Discover Talent</h1>
        <p className="text-muted-foreground">
          {isStudent
            ? "This page is available to non-student members only."
            : "Please sign in to browse student talent."}
        </p>
      </div>
    );
  }

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      s.first_name,
      s.last_name,
      s.email,
      s.organizations?.name,
      getProfile(s)?.bio,
      ...(getProfile(s)?.skills || []),
      ...getCourses(s).map((c) => c.course_name),
      ...getCerts(s).map((c) => c.name),
      ...getCerts(s).map((c) => c.issuer || ""),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const studentById = new Map(filtered.map((s) => [s.id, s]));
  const assignedIds = new Set<string>();

  const groups: { key: string; title: string; subtitle?: string; students: StudentRow[] }[] =
    [];

  classes.forEach((c) => {
    const members = memberships
      .filter((m) => m.class_id === c.id)
      .map((m) => studentById.get(m.student_user_id))
      .filter((s): s is StudentRow => Boolean(s));
    members.forEach((s) => assignedIds.add(s.id));
    if (members.length > 0) {
      groups.push({
        key: c.id,
        title: c.name,
        subtitle: `${c.year} · ${c.session}`,
        students: members.sort((a, b) =>
          `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        ),
      });
    }
  });

  const unassigned = filtered.filter((s) => !assignedIds.has(s.id));
  if (unassigned.length > 0) {
    groups.push({
      key: "unassigned",
      title: "Other Talent",
      students: unassigned.sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      ),
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-7 w-7" />
          Discover Talent
        </h1>
        <p className="text-muted-foreground mt-1">
          Find talented professionals trained by the industry, through the Home Building Foundation.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, skill, organization..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading students...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No students found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.key} className="space-y-3">
              <div className="border-b pb-2">
                <h2 className="text-xl font-semibold">{g.title}</h2>
                {g.subtitle && (
                  <p className="text-sm text-muted-foreground">{g.subtitle}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {g.students.map((s) => (
                  <StudentTalentCard key={s.id} student={s} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
