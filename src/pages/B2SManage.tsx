import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  Plus,
  Trash2,
  UserPlus,
  X,
  Loader2,
  Pencil,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface B2SClass {
  id: string;
  name: string;
  year: number;
  session: string;
  description: string | null;
  sort_order: number;
  created_by?: string | null;
}

interface StudentOption {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url: string | null;
}

interface Enrollment {
  id: string;
  class_id: string;
  student_user_id: string;
}

const currentYear = new Date().getFullYear();

export const B2SManage = () => {
  const { user, isAdministrator, isInitialized } = useAuth();
  const { toast } = useToast();

  const [classes, setClasses] = useState<B2SClass[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<B2SClass | null>(null);
  const [year, setYear] = useState(String(currentYear));
  const [session, setSession] = useState("");
  const [description, setDescription] = useState("");

  const [addStudentFor, setAddStudentFor] = useState<B2SClass | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<B2SClass | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("all");

  const loadAll = async () => {
    setLoading(true);
    const [{ data: c }, { data: s }, { data: e }] = await Promise.all([
      supabase
        .from("b2s_classes")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("user_profiles")
        .select("id, first_name, last_name, email, profile_image_url, user_roles!inner(name)")
        .eq("user_roles.name", "student")
        .order("first_name", { ascending: true }),
      supabase.from("b2s_class_students").select("*"),
    ]);
    setClasses((c as any) || []);
    setStudents(((s as any) || []).map((r: any) => ({
      id: r.id,
      first_name: r.first_name,
      last_name: r.last_name,
      email: r.email,
      profile_image_url: r.profile_image_url,
    })));
    setEnrollments((e as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdministrator) {
      setLoading(false);
      return;
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdministrator]);

  const years = useMemo(
    () => Array.from(new Set(classes.map((c) => c.year))).sort((a, b) => b - a),
    [classes]
  );

  const visibleClasses = useMemo(
    () => (yearFilter === "all" ? classes : classes.filter((c) => String(c.year) === yearFilter)),
    [classes, yearFilter]
  );

  const studentsById = useMemo(() => {
    const map = new Map<string, StudentOption>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  const rosterFor = (classId: string) =>
    enrollments
      .filter((e) => e.class_id === classId)
      .map((e) => ({ enrollment: e, student: studentsById.get(e.student_user_id) }))
      .filter((r) => r.student);

  const openCreate = () => {
    setEditing(null);
    setYear(String(currentYear));
    setSession("");
    setDescription("");
    setFormOpen(true);
  };

  const openEdit = (c: B2SClass) => {
    setEditing(c);
    setYear(String(c.year));
    setSession(c.session);
    setDescription(c.description || "");
    setFormOpen(true);
  };

  const saveClass = async () => {
    if (!session.trim() || !year.trim()) {
      toast({
        title: "Missing information",
        description: "Year and session are required.",
        variant: "destructive",
      });
      return;
    }
    const yearNum = parseInt(year, 10);
    if (Number.isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      toast({ title: "Invalid year", description: "Enter a year between 2000 and 2100.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      year: yearNum,
      session: session.trim(),
      description: description.trim() || null,
    };
    if (!editing) {
      const maxOrder = classes.reduce((max, c) => Math.max(max, c.sort_order ?? 0), 0);
      const { error } = await supabase
        .from("b2s_classes")
        .insert({ ...payload, created_by: user?.id || null, sort_order: maxOrder + 1 });
      setSaving(false);
      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase.from("b2s_classes").update(payload).eq("id", editing.id);
      setSaving(false);
      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
        return;
      }
    }
    toast({ title: editing ? "Class updated" : "Class created" });
    setFormOpen(false);
    loadAll();
  };

  const deleteClass = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("b2s_classes").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Class deleted" });
      loadAll();
    }
    setDeleteTarget(null);
  };

  const addStudent = async (studentId: string) => {
    if (!addStudentFor) return;
    const { error } = await supabase
      .from("b2s_class_students")
      .insert({ class_id: addStudentFor.id, student_user_id: studentId });
    if (error) {
      toast({ title: "Could not add student", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Student added to class" });
    loadAll();
  };

  const removeStudent = async (enrollmentId: string) => {
    const { error } = await supabase.from("b2s_class_students").delete().eq("id", enrollmentId);
    if (error) {
      toast({ title: "Could not remove student", description: error.message, variant: "destructive" });
      return;
    }
    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
  };

  const moveClass = async (index: number, direction: -1 | 1) => {
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= visibleClasses.length) return;
    const a = visibleClasses[index];
    const b = visibleClasses[swapIndex];
    // Swap sort_order values between the two classes
    const updates = [
      { id: a.id, sort_order: b.sort_order },
      { id: b.id, sort_order: a.sort_order },
    ];
    // Optimistic UI update
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === a.id) return { ...c, sort_order: b.sort_order };
        if (c.id === b.id) return { ...c, sort_order: a.sort_order };
        return c;
      })
    );
    const results = await Promise.all(
      updates.map((u) => supabase.from("b2s_classes").update({ sort_order: u.sort_order }).eq("id", u.id))
    );
    const err = results.find((r) => r.error);
    if (err?.error) {
      toast({ title: "Reorder failed", description: err.error.message, variant: "destructive" });
      loadAll();
    }
  };

  if (!isInitialized) return <div className="text-muted-foreground">Loading...</div>;

  if (!isAdministrator) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <h1 className="text-2xl font-bold mb-2">B2S Manage</h1>
        <p className="text-muted-foreground">This page is available to administrators only.</p>
      </div>
    );
  }

  const availableStudents = addStudentFor
    ? students.filter((s) => {
        const enrolled = enrollments.some(
          (e) => e.class_id === addStudentFor.id && e.student_user_id === s.id
        );
        if (enrolled) return false;
        const q = studentSearch.trim().toLowerCase();
        if (!q) return true;
        return `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(q);
      })
    : [];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-7 w-7" />
            B2S Manage
          </h1>
          <p className="text-muted-foreground mt-1">
            Create Building to Scale classes by year and session, and manage which students belong to each class.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {years.length > 0 && (
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> New Session
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading classes...</div>
      ) : visibleClasses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No classes yet. Create your first B2S class to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleClasses.map((c, index) => {
            const roster = rosterFor(c.id);
            return (
              <Card key={c.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
                  <div>
                    <CardTitle className="text-lg flex flex-wrap items-center gap-2">
                      {c.name}
                      <Badge variant="secondary">{c.year}</Badge>
                      <Badge variant="outline">{c.session}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {c.description || `${roster.length} student${roster.length === 1 ? "" : "s"} enrolled`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => moveClass(index, -1)}
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === visibleClasses.length - 1}
                        onClick={() => moveClass(index, 1)}
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStudentSearch("");
                        setAddStudentFor(c);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" /> Add Student
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {roster.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No students in this class yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {roster.map(({ enrollment, student }) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between gap-3 border rounded-md p-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={student!.profile_image_url || undefined}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {`${student!.first_name?.[0] || ""}${student!.last_name?.[0] || ""}`.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {student!.first_name} {student!.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {student!.email}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStudent(enrollment.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / edit class */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Class" : "New B2S Class"}</DialogTitle>
            <DialogDescription>
              Classes are grouped by year and a session label you choose.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Class Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 150))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Year *</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min={2000}
                  max={2100}
                />
              </div>
              <div>
                <Label>Session *</Label>
                <Input
                  value={session}
                  placeholder="e.g. Spring, Fall, Session 1"
                  onChange={(e) => setSession(e.target.value.slice(0, 100))}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                rows={3}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveClass} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Save Changes" : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add students */}
      <Dialog open={!!addStudentFor} onOpenChange={(o) => !o && setAddStudentFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Students</DialogTitle>
            <DialogDescription>
              {addStudentFor ? `${addStudentFor.name} — ${addStudentFor.session} ${addStudentFor.year}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search students by name or email"
              className="pl-9"
            />
          </div>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {availableStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No student profiles available to add.
              </p>
            ) : (
              availableStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 border rounded-md p-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={s.profile_image_url || undefined} className="object-cover" />
                      <AvatarFallback>
                        {`${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {s.first_name} {s.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{s.email}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addStudent(s.id)}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStudentFor(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this class?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" and its student roster will be removed. Student profiles are not deleted.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteClass}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
