import {
  ArrowDown,
  ArrowUp,
  Building2,
  ImageUp,
  LinkIcon,
  Plus,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fallbackFounderImage } from "../../data/siteSettingsFallback";
import { API_BASE_URL } from "../../services/api";
import { getSafeApiErrorMessage } from "../../services/apiError";
import {
  getAdminPublicProfileSettings,
  removeFounderProfileImage,
  updateCompanyInformation,
  updateFounderProfile,
  updateSocialLinks,
  uploadFounderProfileImage,
} from "../../services/adminSettingsService";
import type { SiteSettings } from "../../types/siteSettings";

type CompanyForm = {
  companyName: string;
  contactNumber: string;
  contactEmail: string;
  businessAddress: string;
};

type SocialForm = {
  facebookUrl: string;
  linkedinUrl: string;
};

type FounderForm = {
  founderName: string;
  founderRole: string;
  founderExperienceYears: string;
  founderCurrentResponsibility: string;
  founderShortBiography: string;
  founderFullBiography: string;
  founderExpertise: string[];
};

const fieldClass =
  "mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 disabled:bg-slate-100 disabled:text-slate-500";

function resolveImageUrl(imageUrl: string | undefined) {
  if (!imageUrl) {
    return fallbackFounderImage;
  }

  if (imageUrl.startsWith("/uploads/")) {
    return `${new URL(API_BASE_URL).origin}${imageUrl}`;
  }

  return imageUrl;
}

function buildCompanyForm(settings: SiteSettings): CompanyForm {
  return {
    companyName: settings.company.name,
    contactNumber: settings.company.contactNumber,
    contactEmail: settings.company.email,
    businessAddress: settings.company.address,
  };
}

function buildSocialForm(settings: SiteSettings): SocialForm {
  return {
    facebookUrl: settings.socialLinks.facebook ?? "",
    linkedinUrl: settings.socialLinks.linkedin ?? "",
  };
}

function buildFounderForm(settings: SiteSettings): FounderForm {
  return {
    founderName: settings.founder.name,
    founderRole: settings.founder.role,
    founderExperienceYears: settings.founder.experienceYears,
    founderCurrentResponsibility: settings.founder.currentResponsibility,
    founderShortBiography: settings.founder.shortBiography,
    founderFullBiography: settings.founder.fullBiography,
    founderExpertise: settings.founder.expertise,
  };
}

function notifyPublicSettingsUpdated() {
  window.dispatchEvent(new Event("rrds:site-settings-updated"));
}

function SectionHeader({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: typeof Building2;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const { admin } = useAuth();
  const canEdit = admin?.role === "SUPER_ADMIN" || admin?.role === "ADMIN";
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyForm | null>(null);
  const [socialForm, setSocialForm] = useState<SocialForm | null>(null);
  const [founderForm, setFounderForm] = useState<FounderForm | null>(null);
  const [newExpertise, setNewExpertise] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const founderImageUrl = useMemo(
    () => resolveImageUrl(settings?.founder.imageUrl),
    [settings?.founder.imageUrl],
  );

  const loadSettings = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await getAdminPublicProfileSettings();
      setSettings(result);
      setCompanyForm(buildCompanyForm(result));
      setSocialForm(buildSocialForm(result));
      setFounderForm(buildFounderForm(result));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to load public settings."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function applySettings(result: SiteSettings) {
    setSettings(result);
    setCompanyForm(buildCompanyForm(result));
    setSocialForm(buildSocialForm(result));
    setFounderForm(buildFounderForm(result));
    notifyPublicSettingsUpdated();
  }

  async function saveCompanyInformation() {
    if (!companyForm || !canEdit) return;
    setSavingSection("company");
    setMessage("");

    try {
      const result = await updateCompanyInformation(companyForm);
      applySettings(result);
      setMessage("Company information saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save company information."));
    } finally {
      setSavingSection("");
    }
  }

  async function saveSocialLinks() {
    if (!socialForm || !canEdit) return;
    setSavingSection("social");
    setMessage("");

    try {
      const result = await updateSocialLinks({
        facebookUrl: socialForm.facebookUrl || undefined,
        linkedinUrl: socialForm.linkedinUrl || undefined,
      });
      applySettings(result);
      setMessage("Social links saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save social links."));
    } finally {
      setSavingSection("");
    }
  }

  async function saveFounderProfile() {
    if (!founderForm || !canEdit) return;
    setSavingSection("founder");
    setMessage("");

    try {
      const result = await updateFounderProfile(founderForm);
      applySettings(result);
      setMessage("Founder profile saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save founder profile."));
    } finally {
      setSavingSection("");
    }
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file || !canEdit) return;
    setSavingSection("image");
    setMessage("");

    try {
      const result = await uploadFounderProfileImage(file);
      applySettings(result);
      setMessage("Founder image uploaded.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to upload founder image."));
    } finally {
      setSavingSection("");
    }
  }

  async function handleImageRemove() {
    if (!canEdit || !window.confirm("Remove the founder profile image?")) return;
    setSavingSection("image");
    setMessage("");

    try {
      const result = await removeFounderProfileImage();
      applySettings(result);
      setMessage("Founder image removed.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to remove founder image."));
    } finally {
      setSavingSection("");
    }
  }

  function addExpertise() {
    if (!founderForm) return;
    const value = newExpertise.trim();
    const duplicate = founderForm.founderExpertise.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (!value || duplicate) {
      return;
    }

    setFounderForm({
      ...founderForm,
      founderExpertise: [...founderForm.founderExpertise, value],
    });
    setNewExpertise("");
  }

  function updateExpertise(index: number, value: string) {
    if (!founderForm) return;
    const nextItems = [...founderForm.founderExpertise];
    nextItems[index] = value;
    setFounderForm({ ...founderForm, founderExpertise: nextItems });
  }

  function removeExpertise(index: number) {
    if (!founderForm) return;
    setFounderForm({
      ...founderForm,
      founderExpertise: founderForm.founderExpertise.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  function moveExpertise(index: number, direction: -1 | 1) {
    if (!founderForm) return;
    const target = index + direction;

    if (target < 0 || target >= founderForm.founderExpertise.length) {
      return;
    }

    const nextItems = [...founderForm.founderExpertise];
    const [item] = nextItems.splice(index, 1);
    nextItems.splice(target, 0, item);
    setFounderForm({ ...founderForm, founderExpertise: nextItems });
  }

  if (isLoading || !companyForm || !socialForm || !founderForm) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {!canEdit ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          STAFF accounts can view public settings but cannot update them.
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMessage}
        </section>
      ) : null}

      {message ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {message}
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          Icon={Building2}
          description="These values appear on public contact areas and footer content."
          title="Company Information"
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">
            Company name
            <input
              className={fieldClass}
              disabled={!canEdit || savingSection !== ""}
              onChange={(event) =>
                setCompanyForm({ ...companyForm, companyName: event.target.value })
              }
              value={companyForm.companyName}
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Contact number
            <input
              className={fieldClass}
              disabled={!canEdit || savingSection !== ""}
              onChange={(event) =>
                setCompanyForm({ ...companyForm, contactNumber: event.target.value })
              }
              value={companyForm.contactNumber}
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Email
            <input
              className={fieldClass}
              disabled={!canEdit || savingSection !== ""}
              onChange={(event) =>
                setCompanyForm({ ...companyForm, contactEmail: event.target.value })
              }
              type="email"
              value={companyForm.contactEmail}
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Business address
            <input
              className={fieldClass}
              disabled={!canEdit || savingSection !== ""}
              onChange={(event) =>
                setCompanyForm({ ...companyForm, businessAddress: event.target.value })
              }
              value={companyForm.businessAddress}
            />
          </label>
        </div>
        <button
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!canEdit || savingSection !== ""}
          onClick={() => void saveCompanyInformation()}
          type="button"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {savingSection === "company" ? "Saving..." : "Save Company Information"}
        </button>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          Icon={LinkIcon}
          description="Empty social links are hidden from the public website."
          title="Social Media"
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">
            Facebook URL
            <input
              className={fieldClass}
              disabled={!canEdit || savingSection !== ""}
              onChange={(event) =>
                setSocialForm({ ...socialForm, facebookUrl: event.target.value })
              }
              placeholder="https://www.facebook.com/..."
              value={socialForm.facebookUrl}
            />
            {socialForm.facebookUrl.startsWith("https://") ? (
              <a
                className="mt-2 inline-block text-sm font-semibold text-blue-800 hover:text-blue-900"
                href={socialForm.facebookUrl}
                rel="noreferrer"
                target="_blank"
              >
                Preview Facebook link
              </a>
            ) : null}
          </label>
          <label className="text-sm font-semibold text-slate-800">
            LinkedIn URL
            <input
              className={fieldClass}
              disabled={!canEdit || savingSection !== ""}
              onChange={(event) =>
                setSocialForm({ ...socialForm, linkedinUrl: event.target.value })
              }
              placeholder="https://www.linkedin.com/..."
              value={socialForm.linkedinUrl}
            />
            {socialForm.linkedinUrl.startsWith("https://") ? (
              <a
                className="mt-2 inline-block text-sm font-semibold text-blue-800 hover:text-blue-900"
                href={socialForm.linkedinUrl}
                rel="noreferrer"
                target="_blank"
              >
                Preview LinkedIn link
              </a>
            ) : null}
          </label>
        </div>
        <button
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!canEdit || savingSection !== ""}
          onClick={() => void saveSocialLinks()}
          type="button"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {savingSection === "social" ? "Saving..." : "Save Social Links"}
        </button>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          Icon={UserRound}
          description="This profile appears on the public Home and About pages."
          title="Founder Profile"
        />
        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside>
            <img
              alt="RRDS founder and lead air-conditioning technician"
              className="aspect-square w-full max-w-[240px] rounded-lg border border-slate-200 object-cover shadow-sm"
              src={founderImageUrl}
            />
            <div className="mt-4 space-y-3">
              <label className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <ImageUp aria-hidden="true" className="h-4 w-4" />
                {savingSection === "image" ? "Uploading..." : "Upload Image"}
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={!canEdit || savingSection !== ""}
                  onChange={(event) => void handleImageUpload(event.target.files?.[0])}
                  type="file"
                />
              </label>
              <button
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-red-300 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={!canEdit || savingSection !== "" || !settings?.founder.imageUrl}
                onClick={() => void handleImageRemove()}
                type="button"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Remove Image
              </button>
              <p className="text-xs leading-5 text-slate-500">
                JPEG, PNG, or WebP only. Maximum size is 5 MB.
              </p>
            </div>
          </aside>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800">
                Founder full name
                <input
                  className={fieldClass}
                  disabled={!canEdit || savingSection !== ""}
                  onChange={(event) =>
                    setFounderForm({ ...founderForm, founderName: event.target.value })
                  }
                  value={founderForm.founderName}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Professional title
                <input
                  className={fieldClass}
                  disabled={!canEdit || savingSection !== ""}
                  onChange={(event) =>
                    setFounderForm({ ...founderForm, founderRole: event.target.value })
                  }
                  value={founderForm.founderRole}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Years of experience
                <input
                  className={fieldClass}
                  disabled={!canEdit || savingSection !== ""}
                  onChange={(event) =>
                    setFounderForm({
                      ...founderForm,
                      founderExperienceYears: event.target.value,
                    })
                  }
                  value={founderForm.founderExperienceYears}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Current responsibility
                <input
                  className={fieldClass}
                  disabled={!canEdit || savingSection !== ""}
                  onChange={(event) =>
                    setFounderForm({
                      ...founderForm,
                      founderCurrentResponsibility: event.target.value,
                    })
                  }
                  value={founderForm.founderCurrentResponsibility}
                />
              </label>
            </div>
            <label className="text-sm font-semibold text-slate-800">
              Short biography
              <textarea
                className={`${fieldClass} min-h-28 py-3`}
                disabled={!canEdit || savingSection !== ""}
                onChange={(event) =>
                  setFounderForm({
                    ...founderForm,
                    founderShortBiography: event.target.value,
                  })
                }
                value={founderForm.founderShortBiography}
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Full biography
              <textarea
                className={`${fieldClass} min-h-44 py-3`}
                disabled={!canEdit || savingSection !== ""}
                onChange={(event) =>
                  setFounderForm({ ...founderForm, founderFullBiography: event.target.value })
                }
                value={founderForm.founderFullBiography}
              />
            </label>

            <div>
              <h3 className="text-sm font-bold text-slate-950">Expertise</h3>
              <div className="mt-3 space-y-3">
                {founderForm.founderExpertise.map((item, index) => (
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]" key={`${item}-${index}`}>
                    <input
                      className={fieldClass}
                      disabled={!canEdit || savingSection !== ""}
                      onChange={(event) => updateExpertise(index, event.target.value)}
                      value={item}
                    />
                    <div className="flex gap-2">
                      <button
                        aria-label="Move expertise up"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                        disabled={!canEdit || index === 0}
                        onClick={() => moveExpertise(index, -1)}
                        type="button"
                      >
                        <ArrowUp aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Move expertise down"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                        disabled={!canEdit || index === founderForm.founderExpertise.length - 1}
                        onClick={() => moveExpertise(index, 1)}
                        type="button"
                      >
                        <ArrowDown aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Remove expertise"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                        disabled={!canEdit || founderForm.founderExpertise.length <= 1}
                        onClick={() => removeExpertise(index)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  className={fieldClass}
                  disabled={!canEdit || savingSection !== ""}
                  onChange={(event) => setNewExpertise(event.target.value)}
                  placeholder="Add expertise"
                  value={newExpertise}
                />
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={!canEdit || savingSection !== "" || !newExpertise.trim()}
                  onClick={addExpertise}
                  type="button"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            <button
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-fit"
              disabled={!canEdit || savingSection !== ""}
              onClick={() => void saveFounderProfile()}
              type="button"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              {savingSection === "founder" ? "Saving..." : "Save Founder Profile"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
