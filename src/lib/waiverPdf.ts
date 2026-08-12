import jsPDF from "jspdf";
import { WAIVER_PARAGRAPHS, WAIVER_TITLE } from "@/components/waiver/WaiverText";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface WaiverPdfOptions {
  fullName?: string | null;
  signatureName?: string | null;
  signedAt?: string | null;
}

const DEFAULT_LOGO_URL = "/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png";

const fetchLogoUrl = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('app_settings' as any)
      .select('value')
      .eq('key', 'logo_url')
      .single();

    if (error) throw error;
    return (data as any)?.value || DEFAULT_LOGO_URL;
  } catch (error) {
    console.error('Error fetching logo URL for waiver PDF:', error);
    return DEFAULT_LOGO_URL;
  }
};

interface LoadedLogo {
  dataUrl: string;
  width: number;
  height: number;
}

// Loads the image, flattens transparency onto white and returns a JPEG data URL
// (jsPDF renders alpha PNGs inconsistently, which can result in a blank logo).
const loadLogo = async (url: string): Promise<LoadedLogo> => {
  let src = url;
  let loaded = false;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Could not read logo blob"));
        reader.readAsDataURL(blob);
      });
      loaded = true;
    }
  } catch {
    // CORS-blocked; fall through to the edge-function proxy below
  }

  if (!loaded) {
    try {
      const { data, error } = await supabase.functions.invoke("proxy-image", {
        body: { url },
      });
      if (error) throw error;
      if ((data as any)?.dataUrl) src = (data as any).dataUrl;
    } catch {
      // fall back to loading the URL directly
    }
  }


  return new Promise<LoadedLogo>((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 200;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.92),
          width: canvas.width,
          height: canvas.height,
        });
      } catch (e) {
        reject(e as Error);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = src;
  });
};

export const downloadWaiverPdf = async ({
  fullName,
  signatureName,
  signedAt,
}: WaiverPdfOptions) => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const logoUrl = await fetchLogoUrl();

  try {
    const logo = await loadLogo(logoUrl);
    const logoWidth = 180;
    const logoHeight = Math.max(
      18,
      Math.min(70, (logo.height / logo.width) * logoWidth)
    );
    doc.addImage(logo.dataUrl, "JPEG", margin, y, logoWidth, logoHeight);
    y += logoHeight + 16;
  } catch (error) {
    console.error("Waiver PDF logo failed to load:", error);
    // Fallback to text if logo fails to load
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("HBF Roll Call", margin, y);
    y += 24;
  }


  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text(WAIVER_TITLE, margin, y, { maxWidth });
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);

  if (fullName) {
    doc.text(`Volunteer: ${fullName}`, margin, y);
    y += 22;
  }

  WAIVER_PARAGRAPHS.forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, maxWidth) as string[];
    const blockHeight = lines.length * 14;
    if (y + blockHeight > pageHeight - margin - 120) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y);
    y += blockHeight + 12;
  });

  // Signature block at the bottom of the last page
  const signatureBlockHeight = 100;
  let signatureTop = pageHeight - margin - signatureBlockHeight;
  if (y > signatureTop) {
    doc.addPage();
    signatureTop = pageHeight - margin - signatureBlockHeight;
  }

  doc.setDrawColor(180);
  doc.line(margin, signatureTop, pageWidth - margin, signatureTop);

  let sy = signatureTop + 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Signature", margin, sy);
  sy += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  if (signatureName) {
    doc.text(signatureName, margin, sy);
  } else {
    doc.text("Not signed", margin, sy);
  }
  sy += 16;
  doc.setDrawColor(120);
  doc.line(margin, sy, margin + 240, sy);
  sy += 18;
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(
    signedAt ? `Signed electronically on ${formatDate(signedAt)}` : "Signature date: —",
    margin,
    sy
  );

  const safeName = (signatureName || fullName || "waiver").replace(/[^a-z0-9]+/gi, "-");
  doc.save(`waiver-${safeName.toLowerCase()}.pdf`);
};
