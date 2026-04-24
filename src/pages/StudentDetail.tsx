import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, FileText, GraduationCap, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const StudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { isAuthenticated, userRole, isInitialized } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [work, setWork] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isStudent = userRole?.name === "student";
  const allowed = isAuthenticated && !isStudent;

  useEffect(() => {
    if (!allowed || !studentId) {
      setLoading(false);
      return;
    }
    const fetchAll = async () => {
      setLoading(true);
      const [{ data: u }, { data: p }, { data: w }, { data: e }] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("id, first_name, last_name, email, phone, profile_image_url, organizations:organization_id(name)")
          .eq("id", studentId)
          .maybeSingle(),
        supabase.from("student_profiles").select("*").eq("user_id", studentId).maybeSingle(),
        supabase
          .from("student_work_experience")
          .select("*")
          .eq("user_id", studentId)
          .order("currently_working", { ascending: false })
          .order("start_date", { ascending: false }),
        supabase
          .from("student_education")
          .select("*")
          .eq("user_id", studentId)
          .order("currently_studying", { ascending: false })
          .order("start_date", { ascending: false }),
      ]);
      setStudent(u);
      setProfile(p);
      setWork(w || []);
      setEducation(e || []);
      setLoading(false);
    };
    fetchAll();
  }, [studentId, allowed]);

  if (!isInitialized || loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!allowed) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <p className="text-muted-foreground">You do not have access to view this profile.</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <p className="text-muted-foreground">Student not found.</p>
        <Link to="/discover-talent">
          <Button variant="outline" className="mt-4">Back to Discover Talent</Button>
        </Link>
      </div>
    );
  }

  const initials = `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/discover-talent" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Discover Talent
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start gap-6 space-y-0">
          <Avatar className="h-24 w-24">
            <AvatarImage src={student.profile_image_url || undefined} className="object-cover" />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <CardTitle className="text-2xl">
              {student.first_name} {student.last_name}
            </CardTitle>
            {student.organizations?.name && (
              <p className="text-muted-foreground">{student.organizations.name}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              {student.email && (
                <a href={`mailto:${student.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <Mail className="h-4 w-4" /> {student.email}
                </a>
              )}
              {student.phone && (
                <a href={`tel:${student.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <Phone className="h-4 w-4" /> {student.phone}
                </a>
              )}
              {profile?.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    {profile.resume_filename || "Resume"}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardHeader>
        {profile?.bio && (
          <CardContent>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
          </CardContent>
        )}
      </Card>

      {profile?.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {profile.skills.map((s: string) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Work Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          {work.length === 0 ? (
            <p className="text-sm text-muted-foreground">No work experience listed.</p>
          ) : (
            <div className="space-y-4">
              {work.map((w) => (
                <div key={w.id} className="border-l-2 border-border pl-4">
                  <div className="font-semibold">{w.job_title}</div>
                  <div className="text-sm text-muted-foreground">
                    {w.company}{w.location ? ` • ${w.location}` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {w.start_date ? formatDate(w.start_date) : ""} – {w.currently_working ? "Present" : (w.end_date ? formatDate(w.end_date) : "")}
                  </div>
                  {w.description && <p className="text-sm mt-2 whitespace-pre-wrap">{w.description}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5" /> Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          {education.length === 0 ? (
            <p className="text-sm text-muted-foreground">No education listed.</p>
          ) : (
            <div className="space-y-4">
              {education.map((e) => (
                <div key={e.id} className="border-l-2 border-border pl-4">
                  <div className="font-semibold">{e.school}</div>
                  <div className="text-sm text-muted-foreground">
                    {[e.degree, e.field_of_study].filter(Boolean).join(" • ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.start_date ? formatDate(e.start_date) : ""} – {e.currently_studying ? "Present" : (e.end_date ? formatDate(e.end_date) : "")}
                  </div>
                  {e.description && <p className="text-sm mt-2 whitespace-pre-wrap">{e.description}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
