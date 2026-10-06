import { supabase } from "@/integrations/supabase/client";

export const uploadRequestPhotos = async (files: File[], existing: string[] = []) => {
  if (existing.length + files.length > 3) {
    throw new Error("You can only upload up to three request photos.");
  }

  const paths: string[] = [];
  const urls = [...existing];
  try {
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `request-closeout/post-photos/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("donation-images").upload(path, file);
      if (error) throw error;
      paths.push(path);
      urls.push(supabase.storage.from("donation-images").getPublicUrl(path).data.publicUrl);
    }
    return urls;
  } catch (error) {
    if (paths.length) await supabase.storage.from("donation-images").remove(paths);
    throw error;
  }
};