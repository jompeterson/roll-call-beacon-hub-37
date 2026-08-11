import jsPDF from "jspdf";
import { WAIVER_PARAGRAPHS, WAIVER_TITLE } from "@/components/waiver/WaiverText";
import { formatDate } from "@/lib/utils";

interface WaiverPdfOptions {
  fullName?: string | null;
  signatureName?: string | null;
  signedAt?: string | null;
}

const LOGO_URL = "/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png";

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
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

  try {
    const logoDataUrl = await loadImageAsBase64(LOGO_URL);
    const logoWidth = 140;
    const logoHeight = 40;
    doc.addImage(logoDataUrl, "PNG", margin, y, logoWidth, logoHeight);
    y += logoHeight + 16;
  } catch {
    // Fallback to text if logo fails to load
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
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
