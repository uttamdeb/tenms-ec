import aymanBlack from "@/assets/ayman-black.png";
import aymanWhite from "@/assets/ayman-white.png";
import farhanaBlack from "@/assets/farhana-black.png";
import farhanaWhite from "@/assets/farhana-white.png";
import farhanBlack from "@/assets/farhan-black.png";
import farhanWhite from "@/assets/farhan-white.png";
import mimBlack from "@/assets/mim-black.png";
import mimWhite from "@/assets/mim-white.png";
import mishalBlack from "@/assets/mishal-black.png";
import mishalWhite from "@/assets/mishal-white.png";
import niloyBlack from "@/assets/niloy-black.png";
import niloyWhite from "@/assets/niloy-white.png";
import raiedBlack from "@/assets/raied-black.png";
import raiedWhite from "@/assets/raied-white.png";
import uttamBlack from "@/assets/uttam-black.png";
import uttamWhite from "@/assets/uttam-white.png";

const EMAIL_TO_BRAND: Record<string, "ayman" | "mishal" | "niloy" | "raied" | "mim" | "farhana" | "farhan" | "uttam"> = {
  "ayman@10minuteschool.com": "ayman",
  "mishal@10minuteschool.com": "mishal",
  "niloy@10minuteschool.com": "niloy",
  "raied@10minuteschool.com": "raied",
  "mim@10minuteschool.com": "mim",
  "rabeya.mim@10minuteschool.com": "mim",
  "farhan@10minuteschool.com": "farhan",
  "farhana@10minuteschool.com": "farhana",
  "uttam@10minuteschool.com": "uttam",
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