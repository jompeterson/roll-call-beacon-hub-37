import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, GraduationCap, Plus, Trash2, FileText, Upload, X, Loader2, Save } from "lucide-react";

type WorkRow = {
  id?: string;
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
};

type EduRow = {
  id?: string;
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  currently_studying: boolean;
  description: string;
};

const emptyWork = (): WorkRow => ({
  job_title: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  currently_working: false,
  description: "",
});

const emptyEdu = (): EduRow => ({
  school: "",
  degree: "",
  field_of_study: "",
  start_date: "",
  end_date: "",
  currently_studying: false,
  description: "",
});

export const WorkExperience = () => {
  const { user, userRole, isAuthenticated, isInitialized } = useAuth();
  const { toast } = useToast();
  const isStudent = userRole?.name === "student";

  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [work, setWork] = useState<WorkRow[]>([]);
  const [education, setEducation] = useState<EduRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletedWork, setDeletedWork] = useState<string[]>([]);
  const [deletedEdu, setDeletedEdu] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user || !isStudent) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const [{ data: p }, { data: w }, { data: e }] = await Promise.all([
        supabase.from("student_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("student_work_experience").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
        supabase.from("student_education").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
      ]);
      if (p) {
        setBio(p.bio || "");
        setSkills(p.skills || []);
        setResumeUrl(p.resume_url);
        setResumeFilename(p.resume_filename);
      }
      setWork(
        (w || []).map((r: any) => ({
          id: r.id,
          job_title: r.job_title || "",
          company: r.company || "",
          location: r.location || "",
          start_date: r.start_date || "",
          end_date: r.end_date || "",
          currently_working: r.currently_working,
          description: r.description || "",
        }))
      );
      setEducation(
        (e || []).map((r: any) => ({
          id: r.id,
          school: r.school || "",
          degree: r.degree || "",
          field_of_study: r.field_of_study || "",
          start_date: r.start_date || "",
          end_date: r.end_date || "",
          currently_studying: r.currently_studying,
          description: r.description || "",
        }))
      );
      setLoading(false);
    };
    load();
  }, [user, isAuthenticated, isStudent]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (s.length > 50) {
      toast({ title: "Skill too long", description: "Keep skills under 50 characters.", variant: "destructive" });
      return;
    }
    if (!skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const handleResumeUpload = async (file: File) => {
    if (!user) return;
    const allowed = ["pdf", "doc", "docx"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowed.includes(ext)) {
      toast({ title: "Invalid file", description: "Only PDF, DOC, or DOCX files are allowed.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const path = `${user.id}/resume.${ext}`;
      // remove any prior file at any extension
      for (const e of allowed) {
        if (e !== ext) await supabase.storage.from("resumes").remove([`${user.id}/resume.${e}`]);
      }
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(path);
      const cacheBusted = `${publicUrl}?t=${Date.now()}`;
      setResumeUrl(cacheBusted);
      setResumeFilename(file.name);
      toast({ title: "Resume uploaded", description: file.name });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Upload failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Upsert profile
      const { error: pErr } = await supabase
        .from("student_profiles")
        .upsert(
          {
            user_id: user.id,
            bio: bio.trim() || null,
            skills,
            resume_url: resumeUrl,
            resume_filename: resumeFilename,
          },
          { onConflict: "user_id" }
        );
      if (pErr) throw pErr;

      // Delete removed work/edu
      if (deletedWork.length) {
        await supabase.from("student_work_experience").delete().in("id", deletedWork);
      }
      if (deletedEdu.length) {
        await supabase.from("student_education").delete().in("id", deletedEdu);
      }
      setDeletedWork([]);
      setDeletedEdu([]);

      // Upsert work
      for (const w of work) {
        if (!w.job_title.trim() || !w.company.trim()) continue;
        const payload: any = {
          user_id: user.id,
          job_title: w.job_title.trim(),
          company: w.company.trim(),
          location: w.location.trim() || null,
          start_date: w.start_date || null,
          end_date: w.currently_working ? null : (w.end_date || null),
          currently_working: w.currently_working,
          description: w.description.trim() || null,
        };
        if (w.id) {
          await supabase.from("student_work_experience").update(payload).eq("id", w.id);
        } else {
          await supabase.from("student_work_experience").insert(payload);
        }
      }

      // Upsert education
      for (const e of education) {
        if (!e.school.trim()) continue;
        const payload: any = {
          user_id: user.id,
          school: e.school.trim(),
          degree: e.degree.trim() || null,
          field_of_study: e.field_of_study.trim() || null,
          start_date: e.start_date || null,
          end_date: e.currently_studying ? null : (e.end_date || null),
          currently_studying: e.currently_studying,
          description: e.description.trim() || null,
        };
        if (e.id) {
          await supabase.from("student_education").update(payload).eq("id", e.id);
        } else {
          await supabase.from("student_education").insert(payload);
        }
      }

      toast({ title: "Saved", description: "Your profile has been updated." });

      // Reload to get IDs for new entries
      const [{ data: w }, { data: e }] = await Promise.all([
        supabase.from("student_work_experience").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
        supabase.from("student_education").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
      ]);
      setWork((w || []).map((r: any) => ({ ...r, location: r.location || "", start_date: r.start_date || "", end_date: r.end_date || "", description: r.description || "" })));
      setEducation((e || []).map((r: any) => ({ ...r, degree: r.degree || "", field_of_study: r.field_of_study || "", start_date: r.start_date || "", end_date: r.end_date || "", description: r.description || "" })));
    } catch (err: any) {
      console.error(err);
      toast({ title: "Save failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized) return <div className="text-muted-foreground">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Work Experience</h1>
        <p className="text-muted-foreground">Please sign in to manage your work experience.</p>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Work Experience</h1>
        <p className="text-muted-foreground">This page is only available to student accounts.</p>
      </div>
    );
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-7 w-7" />
            Work Experience
          </h1>
          <p className="text-muted-foreground mt-1">
            Build your profile so partner organizations can discover you.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save
        </Button>
      </div>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About Me</CardTitle>
          <CardDescription>A short bio to introduce yourself.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 1000))}
            placeholder="Tell organizations about yourself, your interests, and your goals..."
            rows={5}
          />
          <p className="text-xs text-muted-foreground mt-1">{bio.length}/1000</p>
        </CardContent>
      </Card>

      {/* Resume */}
      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
          <CardDescription>Upload a PDF, DOC, or DOCX (max 10MB).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {resumeUrl && (
            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm hover:underline truncate">
                {resumeFilename || "Current resume"}
              </a>
            </div>
          )}
          <div>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleResumeUpload(f);
                e.target.value = "";
              }}
            />
            <Label htmlFor="resume-upload">
              <Button variant="outline" asChild disabled={uploading}>
                <span>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {resumeUrl ? "Replace Resume" : "Upload Resume"}
                </span>
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Add tags representing your skills.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
              placeholder="e.g. Carpentry, AutoCAD, Python..."
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Work Experience
            </CardTitle>
            <CardDescription>Add your jobs and internships.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setWork([emptyWork(), ...work])}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {work.length === 0 && (
            <p className="text-sm text-muted-foreground">No work experience added yet.</p>
          )}
          {work.map((w, idx) => (
            <div key={w.id || idx} className="border rounded-md p-4 space-y-3">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (w.id) setDeletedWork([...deletedWork, w.id]);
                    setWork(work.filter((_, i) => i !== idx));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Job Title *</Label>
                  <Input
                    value={w.job_title}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 100);
                      setWork(work.map((x, i) => (i === idx ? { ...x, job_title: v } : x)));
                    }}
                  />
                </div>
                <div>
                  <Label>Company *</Label>
                  <Input
                    value={w.company}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 100);
                      setWork(work.map((x, i) => (i === idx ? { ...x, company: v } : x)));
                    }}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={w.location}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 100);
                      setWork(work.map((x, i) => (i === idx ? { ...x, location: v } : x)));
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={w.start_date}
                      onChange={(e) =>
                        setWork(work.map((x, i) => (i === idx ? { ...x, start_date: e.target.value } : x)))
                      }
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={w.end_date}
                      disabled={w.currently_working}
                      onChange={(e) =>
                        setWork(work.map((x, i) => (i === idx ? { ...x, end_date: e.target.value } : x)))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`current-work-${idx}`}
                  checked={w.currently_working}
                  onCheckedChange={(checked) =>
                    setWork(
                      work.map((x, i) =>
                        i === idx ? { ...x, currently_working: !!checked, end_date: checked ? "" : x.end_date } : x
                      )
                    )
                  }
                />
                <Label htmlFor={`current-work-${idx}`} className="cursor-pointer">
                  I currently work here
                </Label>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={w.description}
                  rows={3}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, 1000);
                    setWork(work.map((x, i) => (i === idx ? { ...x, description: v } : x)));
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> Education
            </CardTitle>
            <CardDescription>Schools, degrees, and certifications.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEducation([emptyEdu(), ...education])}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.length === 0 && (
            <p className="text-sm text-muted-foreground">No education added yet.</p>
          )}
          {education.map((e, idx) => (
            <div key={e.id || idx} className="border rounded-md p-4 space-y-3">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (e.id) setDeletedEdu([...deletedEdu, e.id]);
                    setEducation(education.filter((_, i) => i !== idx));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>School *</Label>
                  <Input
                    value={e.school}
                    onChange={(ev) => {
                      const v = ev.target.value.slice(0, 100);
                      setEducation(education.map((x, i) => (i === idx ? { ...x, school: v } : x)));
                    }}
                  />
                </div>
                <div>
                  <Label>Degree</Label>
                  <Input
                    value={e.degree}
                    onChange={(ev) => {
                      const v = ev.target.value.slice(0, 100);
                      setEducation(education.map((x, i) => (i === idx ? { ...x, degree: v } : x)));
                    }}
                  />
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Input
                    value={e.field_of_study}
                    onChange={(ev) => {
                      const v = ev.target.value.slice(0, 100);
                      setEducation(education.map((x, i) => (i === idx ? { ...x, field_of_study: v } : x)));
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={e.start_date}
                      onChange={(ev) =>
                        setEducation(
                          education.map((x, i) => (i === idx ? { ...x, start_date: ev.target.value } : x))
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={e.end_date}
                      disabled={e.currently_studying}
                      onChange={(ev) =>
                        setEducation(
                          education.map((x, i) => (i === idx ? { ...x, end_date: ev.target.value } : x))
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`current-edu-${idx}`}
                  checked={e.currently_studying}
                  onCheckedChange={(checked) =>
                    setEducation(
                      education.map((x, i) =>
                        i === idx ? { ...x, currently_studying: !!checked, end_date: checked ? "" : x.end_date } : x
                      )
                    )
                  }
                />
                <Label htmlFor={`current-edu-${idx}`} className="cursor-pointer">
                  I currently study here
                </Label>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={e.description}
                  rows={3}
                  onChange={(ev) => {
                    const v = ev.target.value.slice(0, 1000);
                    setEducation(education.map((x, i) => (i === idx ? { ...x, description: v } : x)));
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Changes
        </Button>
      </div>
    </div>
  );
};
