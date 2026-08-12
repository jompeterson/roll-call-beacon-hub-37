import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationSelector } from "@/components/profile/OrganizationSelector";
import { useUserRoles } from "@/hooks/useUserRoles";

interface StudentCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

interface WorkRow {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
}

interface EduRow {
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  currently_studying: boolean;
  description: string;
}

interface CourseRow {
  course_name: string;
  completed_on: string;
}

interface CertRow {
  name: string;
  issuer: string;
  issued_on: string;
  expires_on: string;
}

const emptyWork: WorkRow = {
  job_title: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  currently_working: false,
  description: "",
};

const emptyEdu: EduRow = {
  school: "",
  degree: "",
  field_of_study: "",
  start_date: "",
  end_date: "",
  currently_studying: false,
  description: "",
};

export const StudentCreateModal = ({
  open,
  onOpenChange,
  onUserCreated,
}: StudentCreateModalProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [classId, setClassId] = useState("");
  const { userRoles, loading: rolesLoading } = useUserRoles();
  const [roleId, setRoleId] = useState("");
  const isStudent = userRoles.find((r) => r.id === roleId)?.name === "student";
  const [classes, setClasses] = useState<
    { id: string; name: string; year: number; session: string }[]
  >([]);

  const [work, setWork] = useState<WorkRow[]>([]);
  const [education, setEducation] = useState<EduRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [certifications, setCertifications] = useState<CertRow[]>([]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("b2s_classes")
      .select("id, name, year, session")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setClasses(data || []));
  }, [open]);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setOrganizationId("");
    setBio("");
    setSkills([]);
    setSkillInput("");
    setClassId("");
    setRoleId("");
    setWork([]);
    setEducation([]);
    setCourses([]);
    setCertifications([]);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !address || !roleId) {
      toast({
        title: "Missing information",
        description: "First name, last name, email, phone, address, and role are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const sessionToken = localStorage.getItem("session_token") || "";
      const { data, error } = await supabase.functions.invoke("create-student-user", {
        headers: { "x-session-token": sessionToken },
        body: {
          firstName,
          lastName,
          email,
          phone,
          address,
          roleId,
          organizationId: organizationId || null,
          bio: isStudent ? bio : "",
          skills: isStudent ? skills : [],
          classId: isStudent ? classId || null : null,
          workExperience: isStudent ? work : [],
          education: isStudent ? education : [],
          courses: isStudent ? courses : [],
          certifications: isStudent ? certifications : [],
          appUrl: window.location.origin,
        },
      });

      const errMessage = (error as any)?.message || (data as any)?.error;
      if (errMessage) {
        toast({
          title: "Could not create user",
          description: String(errMessage),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User created",
        description: (data as any)?.emailSent
          ? `An account setup email was sent to ${email}.`
          : `Account created, but the setup email could not be sent to ${email}.`,
      });
      reset();
      onUserCreated();
      onOpenChange(false);
    } catch (err) {
      console.error("Create user error:", err);
      toast({
        title: "Error",
        description: "Failed to create the user account.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Create a user account. They'll receive an email with a link to set their
            password and sign in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-first">First Name *</Label>
                <Input id="s-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-last">Last Name *</Label>
                <Input id="s-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-email">Email *</Label>
                <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-phone">Phone Number *</Label>
                <Input id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-address">Address *</Label>
              <Input id="s-address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Organization (Optional)</Label>
              <OrganizationSelector
                selectedOrganizationId={organizationId}
                onOrganizationSelect={setOrganizationId}
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isStudent && (
              <div className="space-y-2">
                <Label>B2S Class (Optional)</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.session} {c.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {isStudent && (
          <>
          {/* Bio & skills */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Profile</h3>
            <div className="space-y-2">
              <Label htmlFor="s-bio">Bio</Label>
              <Textarea
                id="s-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Short introduction shown on their talent profile"
              />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add a skill and press Enter"
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((x) => x !== s))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* B2S Courses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">B2S Courses</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCourses([...courses, { course_name: "", completed_on: "" }])}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Course
              </Button>
            </div>
            {courses.map((c, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_180px_40px] gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Course Name</Label>
                  <Input
                    value={c.course_name}
                    onChange={(e) => {
                      const next = [...courses];
                      next[i] = { ...c, course_name: e.target.value };
                      setCourses(next);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Completed On</Label>
                  <Input
                    type="date"
                    value={c.completed_on}
                    onChange={(e) => {
                      const next = [...courses];
                      next[i] = { ...c, completed_on: e.target.value };
                      setCourses(next);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setCourses(courses.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Certifications</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setCertifications([
                    ...certifications,
                    { name: "", issuer: "", issued_on: "", expires_on: "" },
                  ])
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Certification
              </Button>
            </div>
            {certifications.map((c, i) => (
              <div key={i} className="space-y-2 border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Certification {i + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={c.name}
                      onChange={(e) => {
                        const next = [...certifications];
                        next[i] = { ...c, name: e.target.value };
                        setCertifications(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Issuer</Label>
                    <Input
                      value={c.issuer}
                      onChange={(e) => {
                        const next = [...certifications];
                        next[i] = { ...c, issuer: e.target.value };
                        setCertifications(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Issued On</Label>
                    <Input
                      type="date"
                      value={c.issued_on}
                      onChange={(e) => {
                        const next = [...certifications];
                        next[i] = { ...c, issued_on: e.target.value };
                        setCertifications(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Expires On</Label>
                    <Input
                      type="date"
                      value={c.expires_on}
                      onChange={(e) => {
                        const next = [...certifications];
                        next[i] = { ...c, expires_on: e.target.value };
                        setCertifications(next);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Work experience */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Work Experience</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWork([...work, { ...emptyWork }])}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Experience
              </Button>
            </div>
            {work.map((w, i) => (
              <div key={i} className="space-y-2 border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Experience {i + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setWork(work.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Job Title</Label>
                    <Input
                      value={w.job_title}
                      onChange={(e) => {
                        const next = [...work];
                        next[i] = { ...w, job_title: e.target.value };
                        setWork(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Company</Label>
                    <Input
                      value={w.company}
                      onChange={(e) => {
                        const next = [...work];
                        next[i] = { ...w, company: e.target.value };
                        setWork(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Location</Label>
                    <Input
                      value={w.location}
                      onChange={(e) => {
                        const next = [...work];
                        next[i] = { ...w, location: e.target.value };
                        setWork(next);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="date"
                        value={w.start_date}
                        onChange={(e) => {
                          const next = [...work];
                          next[i] = { ...w, start_date: e.target.value };
                          setWork(next);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End</Label>
                      <Input
                        type="date"
                        value={w.end_date}
                        disabled={w.currently_working}
                        onChange={(e) => {
                          const next = [...work];
                          next[i] = { ...w, end_date: e.target.value };
                          setWork(next);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`w-current-${i}`}
                    checked={w.currently_working}
                    onCheckedChange={(v) => {
                      const next = [...work];
                      next[i] = { ...w, currently_working: !!v, end_date: v ? "" : w.end_date };
                      setWork(next);
                    }}
                  />
                  <Label htmlFor={`w-current-${i}`} className="text-xs">
                    Currently working here
                  </Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    rows={2}
                    value={w.description}
                    onChange={(e) => {
                      const next = [...work];
                      next[i] = { ...w, description: e.target.value };
                      setWork(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Education</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEducation([...education, { ...emptyEdu }])}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Education
              </Button>
            </div>
            {education.map((ed, i) => (
              <div key={i} className="space-y-2 border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Education {i + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEducation(education.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">School</Label>
                    <Input
                      value={ed.school}
                      onChange={(e) => {
                        const next = [...education];
                        next[i] = { ...ed, school: e.target.value };
                        setEducation(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Degree</Label>
                    <Input
                      value={ed.degree}
                      onChange={(e) => {
                        const next = [...education];
                        next[i] = { ...ed, degree: e.target.value };
                        setEducation(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Field of Study</Label>
                    <Input
                      value={ed.field_of_study}
                      onChange={(e) => {
                        const next = [...education];
                        next[i] = { ...ed, field_of_study: e.target.value };
                        setEducation(next);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="date"
                        value={ed.start_date}
                        onChange={(e) => {
                          const next = [...education];
                          next[i] = { ...ed, start_date: e.target.value };
                          setEducation(next);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End</Label>
                      <Input
                        type="date"
                        value={ed.end_date}
                        disabled={ed.currently_studying}
                        onChange={(e) => {
                          const next = [...education];
                          next[i] = { ...ed, end_date: e.target.value };
                          setEducation(next);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`e-current-${i}`}
                    checked={ed.currently_studying}
                    onCheckedChange={(v) => {
                      const next = [...education];
                      next[i] = { ...ed, currently_studying: !!v, end_date: v ? "" : ed.end_date };
                      setEducation(next);
                    }}
                  />
                  <Label htmlFor={`e-current-${i}`} className="text-xs">
                    Currently studying here
                  </Label>
                </div>
              </div>
            ))}
          </div>
          </>
          )}



          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? "Creating..." : "Create & Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
