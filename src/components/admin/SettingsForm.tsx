"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/settings.client";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-ivory/50 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-ivory/50 mb-1.5 block">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 p-5 space-y-4">
      <p className="eyebrow">{title}</p>
      {children}
    </div>
  );
}

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [values, setValues] = useState<SiteSettings>(initial);
  const [heroImage, setHeroImage] = useState<UploadedImage[]>(
    initial.heroImageUrl ? [{ url: initial.heroImageUrl }] : []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...values, heroImageUrl: heroImage[0]?.url ?? null };
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Save failed");
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Section title="Store Identity">
        <Field label="Store Name" value={values.storeName} onChange={(v) => set("storeName", v)} />
        <Field label="Currency" value={values.currency} onChange={(v) => set("currency", v)} />
        <Field label="Tagline (English)" value={values.taglineEn} onChange={(v) => set("taglineEn", v)} />
        <Field label="Tagline (Español)" value={values.taglineEs} onChange={(v) => set("taglineEs", v)} />
      </Section>

      <Section title="Hero Image">
        <ImageUploader images={heroImage} onChange={(imgs) => setHeroImage(imgs.slice(-1))} folder="homepage" />
        <p className="text-xs text-ivory/40">
          If no image is uploaded, the homepage shows a clean empty state instead of a stock photo.
        </p>
      </Section>

      <Section title="Contact">
        <Field label="Contact Email" value={values.email} onChange={(v) => set("email", v)} />
        <Field label="Phone" value={values.phone} onChange={(v) => set("phone", v)} />
        <Field label="WhatsApp" value={values.whatsapp} onChange={(v) => set("whatsapp", v)} />
        <Field label="Zelle Number" value={values.zelleNumber} onChange={(v) => set("zelleNumber", v)} />
        <Field label="Business Hours (English)" value={values.hoursEn} onChange={(v) => set("hoursEn", v)} />
        <Field label="Business Hours (Español)" value={values.hoursEs} onChange={(v) => set("hoursEs", v)} />
      </Section>

      <Section title="Social">
        <Field label="Instagram URL" value={values.instagram} onChange={(v) => set("instagram", v)} />
        <Field label="TikTok URL" value={values.tiktok} onChange={(v) => set("tiktok", v)} />
      </Section>

      <Section title="Shipping">
        <Field
          label="Standard Shipping Price"
          type="number"
          value={values.shippingPrice}
          onChange={(v) => set("shippingPrice", Number(v))}
        />
        <Field
          label="Free Shipping Threshold"
          type="number"
          value={values.freeShippingThreshold}
          onChange={(v) => set("freeShippingThreshold", Number(v))}
        />
      </Section>

      <Section title="SEO">
        <Field label="SEO Title" value={values.seoTitle} onChange={(v) => set("seoTitle", v)} />
        <TextAreaField label="SEO Description" value={values.seoDescription} onChange={(v) => set("seoDescription", v)} />
      </Section>

      <Section title="Policy Pages — Shipping (Envíos)">
        <TextAreaField label="Español" value={values.policyShippingEs} onChange={(v) => set("policyShippingEs", v)} />
        <TextAreaField label="English" value={values.policyShippingEn} onChange={(v) => set("policyShippingEn", v)} />
      </Section>

      <Section title="Policy Pages — Returns (Devoluciones)">
        <TextAreaField label="Español" value={values.policyReturnsEs} onChange={(v) => set("policyReturnsEs", v)} />
        <TextAreaField label="English" value={values.policyReturnsEn} onChange={(v) => set("policyReturnsEn", v)} />
      </Section>

      <Section title="Policy Pages — Privacy (Privacidad)">
        <TextAreaField label="Español" value={values.policyPrivacyEs} onChange={(v) => set("policyPrivacyEs", v)} />
        <TextAreaField label="English" value={values.policyPrivacyEn} onChange={(v) => set("policyPrivacyEn", v)} />
      </Section>

      <Section title="Policy Pages — Terms (Términos)">
        <TextAreaField label="Español" value={values.policyTermsEs} onChange={(v) => set("policyTermsEs", v)} />
        <TextAreaField label="English" value={values.policyTermsEn} onChange={(v) => set("policyTermsEn", v)} />
      </Section>

      <Section title="Policy Pages — Jewelry Care (Cuidado)">
        <TextAreaField label="Español" value={values.policyCareEs} onChange={(v) => set("policyCareEs", v)} />
        <TextAreaField label="English" value={values.policyCareEn} onChange={(v) => set("policyCareEn", v)} />
      </Section>

      {error && <p className="text-sm text-garnet">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-gold text-onyx px-6 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
      </button>
    </div>
  );
}
