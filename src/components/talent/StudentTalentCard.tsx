import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, FileText, BookOpen, Award } from "lucide-react";
import { Link } from "react-router-dom";

export interface StudentRow {
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
  student_courses: { course_name: string; completed_on: string | null }[] | null;
  student_certifications: { name: string; issuer: string | null }[] | null;
}

type StudentProfileData = StudentRow["student_profiles"];

export const getProfile = (s: StudentRow): NonNullable<StudentProfileData> | null =>
  (Array.isArray(s.student_profiles)
    ? s.student_profiles[0]
    : s.student_profiles) || null;

export const getCourses = (s: StudentRow) => s.student_courses || [];

export const getCerts = (s: StudentRow) => s.student_certifications || [];

export const StudentTalentCard = ({ student: s }: { student: StudentRow }) => {
  const fullName = `${s.first_name} ${s.last_name}`;
  const initials = `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`;
  const sp = getProfile(s);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={s.profile_image_url || undefined} className="object-cover" />
          <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Link
            to={`/discover-talent/${s.id}`}
            className="text-base font-semibold hover:underline truncate"
          >
            {fullName}
          </Link>
          {s.organizations?.name && (
            <p className="text-xs text-muted-foreground truncate">{s.organizations.name}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
            {s.email && (
              <a
                href={`mailto:${s.email}`}
                className="flex items-center gap-1 hover:text-foreground truncate"
              >
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{s.email}</span>
              </a>
            )}
            {s.phone && (
              <a
                href={`tel:${s.phone}`}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Phone className="h-3 w-3 shrink-0" />
                {s.phone}
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        {sp?.bio && <p className="text-sm text-foreground line-clamp-2">{sp.bio}</p>}
        {sp?.skills && sp.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sp.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs px-2 py-0">
                {skill}
              </Badge>
            ))}
            {sp.skills.length > 6 && (
              <Badge variant="outline" className="text-xs px-2 py-0">+{sp.skills.length - 6}</Badge>
            )}
          </div>
        )}
        {getCourses(s).length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-0.5">
              <BookOpen className="h-3 w-3" /> Building to Scale Courses
            </p>
            <ul className="list-disc pl-4 space-y-0">
              {getCourses(s).slice(0, 3).map((c, i) => (
                <li key={`${c.course_name}-${i}`} className="text-xs text-foreground">
                  {c.course_name}
                </li>
              ))}
              {getCourses(s).length > 3 && (
                <li className="text-xs text-muted-foreground">
                  +{getCourses(s).length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
        {getCerts(s).length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-0.5">
              <Award className="h-3 w-3" /> Certifications
            </p>
            <ul className="list-disc pl-4 space-y-0">
              {getCerts(s).slice(0, 3).map((c, i) => (
                <li key={`${c.name}-${i}`} className="text-xs text-foreground">
                  {c.name}
                  {c.issuer && <span className="text-muted-foreground"> — {c.issuer}</span>}
                </li>
              ))}
              {getCerts(s).length > 3 && (
                <li className="text-xs text-muted-foreground">
                  +{getCerts(s).length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          {sp?.resume_url && (
            <a href={sp.resume_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-8 text-xs px-2">
                <FileText className="h-3 w-3 mr-1" />
                {sp.resume_filename ? "View Resume" : "Resume"}
              </Button>
            </a>
          )}
          <Link to={`/discover-talent/${s.id}`}>
            <Button variant="default" size="sm" className="h-8 text-xs px-2">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
