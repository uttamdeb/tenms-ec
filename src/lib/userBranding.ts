import aymanBlack from "@/assets/Ayman - Black.png";
import aymanWhite from "@/assets/Ayman - White.png";
import farhanaBlack from "@/assets/Farhana Dina - Black.png";
import farhanaWhite from "@/assets/Farhana Dina - White.png";
import farhanBlack from "@/assets/Farhan - Black.png";
import farhanWhite from "@/assets/Farhan - White.png";
import mimBlack from "@/assets/Mim - Black.png";
import mimWhite from "@/assets/Mim - White.png";
import mishalBlack from "@/assets/Mishal - Black.png";
import mishalWhite from "@/assets/Mishal - White.png";
import niloyBlack from "@/assets/Niloy - Black.png";
import niloyWhite from "@/assets/Niloy - White.png";
import raiedBlack from "@/assets/Raied - Black.png";
import raiedWhite from "@/assets/Raied - White.png";
import uttamBlack from "@/assets/Uttam - Black.png";
import uttamWhite from "@/assets/Uttam - White.png";

const EMAIL_TO_BRAND: Record<string, "ayman" | "mishal" | "niloy" | "raied" | "mim" | "farhana" | "farhan" | "uttam"> = {
  "ayman@10minuteschool.com": "ayman",
  "mishal@10minuteschool.com": "mishal",
  "niloy@10minuteschool.com": "niloy",
  "raied@10minuteschool.com": "raied",
  "mim@10minuteschool.com": "mim",
  "farhan@10minuteschool.com": "farhan",
  "farhana@10minuteschool.com": "farhana",
  "uttam@10minuteschool.com": "uttam",
  "uttamdeb670@gmail.com": "uttam",
  "uttamdeb670@outlook.com": "uttam",
};

const BRAND_ASSETS = {
  ayman: { light: aymanBlack, dark: aymanWhite, alt: "Ayman logo" },
  mishal: { light: mishalBlack, dark: mishalWhite, alt: "Mishal logo" },
  niloy: { light: niloyBlack, dark: niloyWhite, alt: "Niloy logo" },
  raied: { light: raiedBlack, dark: raiedWhite, alt: "Raied logo" },
  mim: { light: mimBlack, dark: mimWhite, alt: "Mim logo" },
  farhan: { light: farhanBlack, dark: farhanWhite, alt: "Farhan logo" },
  farhana: { light: farhanaBlack, dark: farhanaWhite, alt: "Farhana logo" },
  uttam: { light: uttamBlack, dark: uttamWhite, alt: "Uttam logo" },
} as const;

export function getUserBranding(email: string | null | undefined, theme: string | undefined) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const brandKey = EMAIL_TO_BRAND[normalizedEmail];
  if (!brandKey) return null;

  const brand = BRAND_ASSETS[brandKey];
  const isDark = theme === "dark";

  return {
    src: isDark ? brand.dark : brand.light,
    alt: brand.alt,
  };
}