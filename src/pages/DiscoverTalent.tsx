import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, FileText, Search, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image_url: string | null;
  organization_id: string | null;
  organizations: { name: string } | null;
  student_profiles: {
    bio: string | null;
    skills: string[] | null;
    resume_url: string | null;
    resume_filename: string | null;
  } | null;
}

export const DiscoverTalent = () => {
  const { isAuthenticated, userRole, isInitialized } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isStudent = userRole?.name === "student";
  const allowed = isAuthenticated && !isStudent;

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    const fetchStudents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          id, first_name, last_name, email, phone, profile_image_url, organization_id,
          organizations:organization_id ( name ),
          user_roles!inner ( name ),
          student_profiles ( bio, skills, resume_url, resume_filename )
        `)
        .eq("user_roles.name", "student")
        .eq("is_approved", true);

      if (error) {
        console.error("Error fetching students:", error);
      } else {
        setStudents((data as any) || []);
      }
      setLoading(false);
    };
    fetchStudents();
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
      s.student_profiles?.bio,
      ...(s.student_profiles?.skills || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-7 w-7" />
          Discover Talent
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse student profiles, skills, and resumes.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const fullName = `${s.first_name} ${s.last_name}`;
            const initials = `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`;
            const sp = s.student_profiles;
            return (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={s.profile_image_url || undefined} className="object-cover" />
                    <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link
                      to={`/discover-talent/${s.id}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {fullName}
                    </Link>
                    {s.organizations?.name && (
                      <p className="text-sm text-muted-foreground">
                        {s.organizations.name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      {s.email && (
                        <a
                          href={`mailto:${s.email}`}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          <Mail className="h-3 w-3" />
                          {s.email}
                        </a>
                      )}
                      {s.phone && (
                        <a
                          href={`tel:${s.phone}`}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          <Phone className="h-3 w-3" />
                          {s.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sp?.bio && (
                    <p className="text-sm text-foreground line-clamp-3">{sp.bio}</p>
                  )}
                  {sp?.skills && sp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sp.skills.slice(0, 8).map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {sp.skills.length > 8 && (
                        <Badge variant="outline">+{sp.skills.length - 8}</Badge>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    {sp?.resume_url && (
                      <a href={sp.resume_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                      </a>
                    )}
                    <Link to={`/discover-talent/${s.id}`}>
                      <Button variant="default" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
