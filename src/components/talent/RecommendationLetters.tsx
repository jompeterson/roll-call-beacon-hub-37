import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { customAuth } from "@/lib/customAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Loader2, Download, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Letter {
  name: string;
  createdAt: string | null;
  size: number | null;
  url: string | null;
}

interface Props {
  studentId: string;
  canUpload?: boolean;
  description?: string;
}

export const RecommendationLetters = ({ studentId, canUpload = false, description }: Props) => {
  const { toast } = useToast();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const call = useCallback(async (payload: Record<string, unknown>) => {
    const token = customAuth.getSession()?.access_token;
    const { data, error } = await supabase.functions.invoke("recommendation-letters", {
      body: { studentId, ...payload },
      headers: token ? { "x-session-token": token } : undefined,
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }, [studentId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await call({ action: "list" });
      setLetters(data?.letters || []);
    } catch (e) {
      console.error("Failed to load recommendation letters", e);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    if (studentId) load();
  }, [studentId, load]);

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 10MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      await call({
        action: "upload",
        filename: file.name,
        contentType: file.type,
        fileBase64: btoa(binary),
      });
      toast({ title: "Letter uploaded", description: "The letter of recommendation was saved." });
      await load();
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await call({ action: "delete", name });
      await load();
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayName = (name: string) => name.replace(/^\d+-/, "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" /> Letters of Recommendation
        </CardTitle>
        <CardDescription>
          {description || "Private — visible only to administrators and this graduate."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : letters.length === 0 ? (
          <p className="text-sm text-muted-foreground">No letters of recommendation yet.</p>
        ) : (
          <div className="space-y-2">
            {letters.map((l) => (
              <div key={l.name} className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{displayName(l.name)}</p>
                  {l.createdAt && (
                    <p className="text-xs text-muted-foreground">Uploaded {formatDate(l.createdAt)}</p>
                  )}
                </div>
                {l.url && (
                  <a href={l.url} target="_blank" rel="noopener noreferrer" download>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </a>
                )}
                {canUpload && (
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(l.name)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {canUpload && (
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload Letter of Recommendation
            </Button>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX up to 10MB.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
