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
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fallbackFounderImage } from "../../data/siteSettingsFallback";
import { API_BASE_URL } from "../../services/api";
import { getSafeApiErrorMessage } from "../../services/apiError";
import {
  getAdminPublicProfileSettings,
  deleteHomeCarouselImage,
  reorderHomeCarouselImages,
  removeFounderProfileImage,
  updateCompanyInformation,
  updateFounderProfile,
  updateHomeCarouselImage,
  updateAboutPageSettings,
  updateHomePageSettings,
  updateSocialLinks,
  uploadHomeCarouselImage,
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

type HomeForm = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
  secondaryCtaLabel: string;
  secondaryCtaPath: string;
  stats: Array<{ label: string; value: string }>;
  whyEyebrow: string;
  whyTitle: string;
  whyDescription: string;
  servicesEyebrow: string;
  servicesTitle: string;
  servicesDescription: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutCtaLabel: string;
  projectsEyebrow: string;
  projectsTitle: string;
  projectsDescription: string;
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonialsDescription: string;
};

type AboutForm = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  introTitle: string;
  introParagraphs: string[];
  commitmentTitle: string;
  commitmentDescription: string;
  missionTitle: string;
  missionDescription: string;
  visionTitle: string;
  visionDescription: string;
  valuesEyebrow: string;
  valuesTitle: string;
  valuesDescription: string;
  coreValues: string[];
  whyEyebrow: string;
  whyTitle: string;
  whyDescription: string;
  whyItems: Array<{
    title: string;
    description: string;
  }>;
  finalTitle: string;
  finalDescription: string;
};

type SettingsTab = "company" | "social" | "home" | "about" | "founder";

const fieldClass =
  "mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 disabled:bg-slate-100 disabled:text-slate-500";

function getActiveSettingsTab(value: string | null): SettingsTab {
  if (value === "social" || value === "home" || value === "about" || value === "founder") {
    return value;
  }

  return "company";
}

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

function buildHomeForm(settings: SiteSettings): HomeForm {
  return {
    heroEyebrow: settings.home.heroEyebrow,
    heroTitle: settings.home.heroTitle,
    heroSubtitle: settings.home.heroSubtitle,
    primaryCtaLabel: settings.home.primaryCtaLabel,
    primaryCtaPath: settings.home.primaryCtaPath,
    secondaryCtaLabel: settings.home.secondaryCtaLabel,
    secondaryCtaPath: settings.home.secondaryCtaPath,
    stats: settings.home.stats,
    whyEyebrow: settings.home.whyEyebrow,
    whyTitle: settings.home.whyTitle,
    whyDescription: settings.home.whyDescription,
    servicesEyebrow: settings.home.servicesEyebrow,
    servicesTitle: settings.home.servicesTitle,
    servicesDescription: settings.home.servicesDescription,
    aboutEyebrow: settings.home.aboutEyebrow,
    aboutTitle: settings.home.aboutTitle,
    aboutDescription: settings.home.aboutDescription,
    aboutCtaLabel: settings.home.aboutCtaLabel,
    projectsEyebrow: settings.home.projectsEyebrow,
    projectsTitle: settings.home.projectsTitle,
    projectsDescription: settings.home.projectsDescription,
    testimonialsEyebrow: settings.home.testimonialsEyebrow,
    testimonialsTitle: settings.home.testimonialsTitle,
    testimonialsDescription: settings.home.testimonialsDescription,
  };
}

function buildAboutForm(settings: SiteSettings): AboutForm {
  return {
    heroEyebrow: settings.about.heroEyebrow,
    heroTitle: settings.about.heroTitle,
    heroDescription: settings.about.heroDescription,
    introTitle: settings.about.introTitle,
    introParagraphs: settings.about.introParagraphs,
    commitmentTitle: settings.about.commitmentTitle,
    commitmentDescription: settings.about.commitmentDescription,
    missionTitle: settings.about.missionTitle,
    missionDescription: settings.about.missionDescription,
    visionTitle: settings.about.visionTitle,
    visionDescription: settings.about.visionDescription,
    valuesEyebrow: settings.about.valuesEyebrow,
    valuesTitle: settings.about.valuesTitle,
    valuesDescription: settings.about.valuesDescription,
    coreValues: settings.about.coreValues,
    whyEyebrow: settings.about.whyEyebrow,
    whyTitle: settings.about.whyTitle,
    whyDescription: settings.about.whyDescription,
    whyItems: settings.about.whyItems,
    finalTitle: settings.about.finalTitle,
    finalDescription: settings.about.finalDescription,
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
  const [searchParams] = useSearchParams();
  const activeTab = getActiveSettingsTab(searchParams.get("tab"));
  const canEdit = admin?.role === "SUPER_ADMIN" || admin?.role === "ADMIN";
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyForm | null>(null);
  const [socialForm, setSocialForm] = useState<SocialForm | null>(null);
  const [founderForm, setFounderForm] = useState<FounderForm | null>(null);
  const [homeForm, setHomeForm] = useState<HomeForm | null>(null);
  const [aboutForm, setAboutForm] = useState<AboutForm | null>(null);
  const [carouselAltText, setCarouselAltText] = useState("Professional air-conditioning technician");
  const [carouselCaption, setCarouselCaption] = useState("");
  const [newExpertise, setNewExpertise] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isSaving = savingSection !== "";

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
      setHomeForm(buildHomeForm(result));
      setAboutForm(buildAboutForm(result));
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

  useEffect(() => {
    if (!message && !errorMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMessage("");
      setErrorMessage("");
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [errorMessage, message]);

  function applySettings(result: SiteSettings) {
    setSettings(result);
    setCompanyForm(buildCompanyForm(result));
    setSocialForm(buildSocialForm(result));
    setFounderForm(buildFounderForm(result));
    setHomeForm(buildHomeForm(result));
    setAboutForm(buildAboutForm(result));
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

  async function saveHomePage() {
    if (!homeForm || !canEdit) return;
    setSavingSection("home");
    setMessage("");

    try {
      const result = await updateHomePageSettings(homeForm);
      applySettings(result);
      setMessage("Home page settings saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save home page settings."));
    } finally {
      setSavingSection("");
    }
  }

  async function saveAboutPage() {
    if (!aboutForm || !canEdit) return;
    setSavingSection("about");
    setMessage("");

    try {
      const result = await updateAboutPageSettings(aboutForm);
      applySettings(result);
      setMessage("About page settings saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save about page settings."));
    } finally {
      setSavingSection("");
    }
  }

  async function handleHomeCarouselUpload(file: File | undefined) {
    if (!file || !canEdit) return;
    setSavingSection("home-image");
    setMessage("");

    try {
      const result = await uploadHomeCarouselImage(file, carouselAltText, carouselCaption);
      applySettings(result);
      setCarouselAltText("Professional air-conditioning technician");
      setCarouselCaption("");
      setMessage("Home carousel image uploaded.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to upload home carousel image."));
    } finally {
      setSavingSection("");
    }
  }

  async function handleHomeCarouselMetaSave(
    imageId: string | undefined,
    altText: string,
    caption: string | undefined,
  ) {
    if (!imageId || !canEdit) return;
    setSavingSection(`home-image-${imageId}`);
    setMessage("");

    try {
      const result = await updateHomeCarouselImage(imageId, { altText, caption });
      applySettings(result);
      setMessage("Home carousel image details saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save carousel image."));
    } finally {
      setSavingSection("");
    }
  }

  async function handleHomeCarouselDelete(imageId: string | undefined) {
    if (!imageId || !canEdit || !window.confirm("Remove this Home carousel image?")) return;
    setSavingSection(`home-image-${imageId}`);
    setMessage("");

    try {
      const result = await deleteHomeCarouselImage(imageId);
      applySettings(result);
      setMessage("Home carousel image removed.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to remove carousel image."));
    } finally {
      setSavingSection("");
    }
  }

  async function moveHomeCarouselImage(index: number, direction: -1 | 1) {
    if (!settings || !canEdit) return;
    const target = index + direction;
    const images = settings.home.carouselImages;

    if (target < 0 || target >= images.length) {
      return;
    }

    const nextImages = [...images];
    const [image] = nextImages.splice(index, 1);
    nextImages.splice(target, 0, image);
    const imageIds = nextImages.flatMap((item) => (item.id ? [item.id] : []));

    if (imageIds.length !== nextImages.length) {
      return;
    }

    setSavingSection("home-reorder");

    try {
      const result = await reorderHomeCarouselImages(imageIds);
      applySettings(result);
      setMessage("Home carousel order saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to reorder carousel images."));
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

  function updateAboutList(
    key: "introParagraphs" | "coreValues",
    index: number,
    value: string,
  ) {
    if (!aboutForm) return;
    const nextItems = [...aboutForm[key]];
    nextItems[index] = value;
    setAboutForm({ ...aboutForm, [key]: nextItems });
  }

  function addAboutListItem(key: "introParagraphs" | "coreValues", value: string) {
    if (!aboutForm) return;
    setAboutForm({ ...aboutForm, [key]: [...aboutForm[key], value] });
  }

  function removeAboutListItem(key: "introParagraphs" | "coreValues", index: number) {
    if (!aboutForm || aboutForm[key].length <= 1) return;
    setAboutForm({
      ...aboutForm,
      [key]: aboutForm[key].filter((_, itemIndex) => itemIndex !== index),
    });
  }

  function updateAboutWhyItem(
    index: number,
    field: "title" | "description",
    value: string,
  ) {
    if (!aboutForm) return;
    const nextItems = [...aboutForm.whyItems];
    nextItems[index] = { ...nextItems[index], [field]: value };
    setAboutForm({ ...aboutForm, whyItems: nextItems });
  }

  function addAboutWhyItem() {
    if (!aboutForm || aboutForm.whyItems.length >= 6) return;
    setAboutForm({
      ...aboutForm,
      whyItems: [
        ...aboutForm.whyItems,
        {
          title: "New reason",
          description: "Add a short customer-facing reason to choose RRDS.",
        },
      ],
    });
  }

  function removeAboutWhyItem(index: number) {
    if (!aboutForm || aboutForm.whyItems.length <= 1) return;
    setAboutForm({
      ...aboutForm,
      whyItems: aboutForm.whyItems.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  if (isLoading || !companyForm || !socialForm || !founderForm || !homeForm || !aboutForm) {
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
      {message || errorMessage ? (
        <div className="fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm">
          <div
            className={`rounded-lg border p-4 text-sm font-semibold shadow-lg ${
              errorMessage
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
            role="alert"
          >
            {errorMessage || message}
          </div>
        </div>
      ) : null}

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

      {activeTab === "company" ? (
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
              disabled={!canEdit}
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
              disabled={!canEdit}
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
              disabled={!canEdit}
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
              disabled={!canEdit}
              onChange={(event) =>
                setCompanyForm({ ...companyForm, businessAddress: event.target.value })
              }
              value={companyForm.businessAddress}
            />
          </label>
        </div>
        <button
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!canEdit || isSaving}
          onClick={() => void saveCompanyInformation()}
          type="button"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {savingSection === "company" ? "Saving..." : "Save Company Information"}
        </button>
      </section>
      ) : null}

      {activeTab === "social" ? (
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
              disabled={!canEdit}
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
              disabled={!canEdit}
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
          disabled={!canEdit || isSaving}
          onClick={() => void saveSocialLinks()}
          type="button"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {savingSection === "social" ? "Saving..." : "Save Social Links"}
        </button>
      </section>
      ) : null}

      {activeTab === "home" ? (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          Icon={ImageUp}
          description="Manage Home page hero text, section headings, and the technician image carousel."
          title="Home Page"
        />

        <div className="mt-6 grid gap-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Hero Section
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["heroEyebrow", "Hero eyebrow"],
                ["heroTitle", "Hero title"],
                ["primaryCtaLabel", "Primary button label"],
                ["primaryCtaPath", "Primary button path"],
                ["secondaryCtaLabel", "Secondary button label"],
                ["secondaryCtaPath", "Secondary button path"],
              ].map(([key, label]) => (
                <label className="text-sm font-semibold text-slate-800" key={key}>
                  {label}
                  <input
                    className={fieldClass}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setHomeForm({ ...homeForm, [key]: event.target.value })
                    }
                    value={String(homeForm[key as keyof HomeForm])}
                  />
                </label>
              ))}
              <label className="text-sm font-semibold text-slate-800 md:col-span-2">
                Hero subtitle
                <textarea
                  className={`${fieldClass} min-h-24 py-3`}
                  disabled={!canEdit}
                  onChange={(event) =>
                    setHomeForm({ ...homeForm, heroSubtitle: event.target.value })
                  }
                  value={homeForm.heroSubtitle}
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Hero Stats
            </h3>
            <div className="mt-4 grid gap-3">
              {homeForm.stats.map((stat, index) => (
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" key={`${stat.label}-${index}`}>
                  <input
                    aria-label="Stat label"
                    className={fieldClass}
                    disabled={!canEdit}
                    onChange={(event) => {
                      const nextStats = [...homeForm.stats];
                      nextStats[index] = { ...stat, label: event.target.value };
                      setHomeForm({ ...homeForm, stats: nextStats });
                    }}
                    value={stat.label}
                  />
                  <input
                    aria-label="Stat value"
                    className={fieldClass}
                    disabled={!canEdit}
                    onChange={(event) => {
                      const nextStats = [...homeForm.stats];
                      nextStats[index] = { ...stat, value: event.target.value };
                      setHomeForm({ ...homeForm, stats: nextStats });
                    }}
                    value={stat.value}
                  />
                  <button
                    aria-label="Remove stat"
                    className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                    disabled={!canEdit || homeForm.stats.length <= 1}
                    onClick={() =>
                      setHomeForm({
                        ...homeForm,
                        stats: homeForm.stats.filter((_, statIndex) => statIndex !== index),
                      })
                    }
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={!canEdit || homeForm.stats.length >= 6}
              onClick={() =>
                setHomeForm({
                  ...homeForm,
                  stats: [...homeForm.stats, { label: "New Stat", value: "Value" }],
                })
              }
              type="button"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Stat
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Section Text
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                ["why", "Why Choose"],
                ["services", "Services"],
                ["projects", "Projects"],
                ["testimonials", "Testimonials"],
              ].map(([prefix, label]) => (
                <div className="rounded-md border border-slate-200 p-4" key={prefix}>
                  <h4 className="text-sm font-bold text-slate-950">{label}</h4>
                  {["Eyebrow", "Title", "Description"].map((suffix) => {
                    const key = `${prefix}${suffix}` as keyof HomeForm;
                    return (
                      <label className="mt-3 block text-xs font-semibold text-slate-700" key={key}>
                        {suffix}
                        <input
                          className={fieldClass}
                          disabled={!canEdit}
                          onChange={(event) =>
                            setHomeForm({ ...homeForm, [key]: event.target.value })
                          }
                          value={String(homeForm[key])}
                        />
                      </label>
                    );
                  })}
                </div>
              ))}
              <div className="rounded-md border border-slate-200 p-4 md:col-span-3">
                <h4 className="text-sm font-bold text-slate-950">About Preview</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {[
                    ["aboutEyebrow", "Eyebrow"],
                    ["aboutTitle", "Title"],
                    ["aboutCtaLabel", "Button label"],
                  ].map(([key, label]) => (
                    <label className="text-xs font-semibold text-slate-700" key={key}>
                      {label}
                      <input
                        className={fieldClass}
                        disabled={!canEdit}
                        onChange={(event) =>
                          setHomeForm({ ...homeForm, [key]: event.target.value })
                        }
                        value={String(homeForm[key as keyof HomeForm])}
                      />
                    </label>
                  ))}
                  <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                    Description
                    <textarea
                      className={`${fieldClass} min-h-28 py-3`}
                      disabled={!canEdit}
                      onChange={(event) =>
                        setHomeForm({ ...homeForm, aboutDescription: event.target.value })
                      }
                      value={homeForm.aboutDescription}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-fit"
            disabled={!canEdit || isSaving}
            onClick={() => void saveHomePage()}
            type="button"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            {savingSection === "home" ? "Saving..." : "Save Home Page Content"}
          </button>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Hero Carousel Images
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <input
                aria-label="New carousel image alt text"
                className={fieldClass}
                disabled={!canEdit}
                onChange={(event) => setCarouselAltText(event.target.value)}
                placeholder="Alt text"
                value={carouselAltText}
              />
              <input
                aria-label="New carousel image caption"
                className={fieldClass}
                disabled={!canEdit}
                onChange={(event) => setCarouselCaption(event.target.value)}
                placeholder="Optional caption"
                value={carouselCaption}
              />
              <label className="mt-2 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <ImageUp aria-hidden="true" className="h-4 w-4" />
                {savingSection === "home-image" ? "Uploading..." : "Upload Image"}
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={!canEdit || isSaving || !carouselAltText.trim()}
                  onChange={(event) => void handleHomeCarouselUpload(event.target.files?.[0])}
                  type="file"
                />
              </label>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              JPEG, PNG, or WebP only. Maximum size is 5 MB. If no images are uploaded, the Home page uses the safe default visual.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {settings?.home.carouselImages.map((image, index) => (
                <article className="rounded-md border border-slate-200 p-4" key={image.imageUrl}>
                  <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                    <img
                      alt={image.altText}
                      className="aspect-[4/3] w-full rounded-md object-cover"
                      src={resolveImageUrl(image.imageUrl)}
                    />
                    <div className="grid gap-3">
                      <input
                        aria-label="Carousel image alt text"
                        className={fieldClass}
                        defaultValue={image.altText}
                        disabled={!canEdit}
                        id={`home-carousel-alt-${image.id}`}
                      />
                      <input
                        aria-label="Carousel image caption"
                        className={fieldClass}
                        defaultValue={image.caption ?? ""}
                        disabled={!canEdit}
                        id={`home-carousel-caption-${image.id}`}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                          disabled={!canEdit || index === 0 || isSaving}
                          onClick={() => void moveHomeCarouselImage(index, -1)}
                          type="button"
                        >
                          <ArrowUp aria-hidden="true" className="h-4 w-4" />
                        </button>
                        <button
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                          disabled={
                            !canEdit ||
                            index === settings.home.carouselImages.length - 1 ||
                            isSaving
                          }
                          onClick={() => void moveHomeCarouselImage(index, 1)}
                          type="button"
                        >
                          <ArrowDown aria-hidden="true" className="h-4 w-4" />
                        </button>
                        <button
                          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          disabled={!canEdit || isSaving}
                          onClick={() => {
                            const altInput = document.getElementById(
                              `home-carousel-alt-${image.id}`,
                            ) as HTMLInputElement | null;
                            const captionInput = document.getElementById(
                              `home-carousel-caption-${image.id}`,
                            ) as HTMLInputElement | null;
                            void handleHomeCarouselMetaSave(
                              image.id,
                              altInput?.value ?? image.altText,
                              captionInput?.value,
                            );
                          }}
                          type="button"
                        >
                          {savingSection === `home-image-${image.id}` ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-red-300 px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                          disabled={!canEdit || isSaving}
                          onClick={() => void handleHomeCarouselDelete(image.id)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {activeTab === "about" ? (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          Icon={Building2}
          description="Manage the public About Us page text without changing frontend code."
          title="About Page"
        />

        <div className="mt-6 grid gap-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Page Header
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800">
                Eyebrow
                <input
                  className={fieldClass}
                  disabled={!canEdit}
                  onChange={(event) =>
                    setAboutForm({ ...aboutForm, heroEyebrow: event.target.value })
                  }
                  value={aboutForm.heroEyebrow}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Title
                <input
                  className={fieldClass}
                  disabled={!canEdit}
                  onChange={(event) =>
                    setAboutForm({ ...aboutForm, heroTitle: event.target.value })
                  }
                  value={aboutForm.heroTitle}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800 md:col-span-2">
                Description
                <textarea
                  className={`${fieldClass} min-h-24 py-3`}
                  disabled={!canEdit}
                  onChange={(event) =>
                    setAboutForm({ ...aboutForm, heroDescription: event.target.value })
                  }
                  value={aboutForm.heroDescription}
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Company Introduction
            </h3>
            <label className="mt-4 block text-sm font-semibold text-slate-800">
              Section title
              <input
                className={fieldClass}
                disabled={!canEdit}
                onChange={(event) =>
                  setAboutForm({ ...aboutForm, introTitle: event.target.value })
                }
                value={aboutForm.introTitle}
              />
            </label>
            <div className="mt-4 grid gap-3">
              {aboutForm.introParagraphs.map((paragraph, index) => (
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]" key={`intro-${index}`}>
                  <textarea
                    aria-label={`Company introduction paragraph ${index + 1}`}
                    className={`${fieldClass} min-h-24 py-3`}
                    disabled={!canEdit}
                    onChange={(event) =>
                      updateAboutList("introParagraphs", index, event.target.value)
                    }
                    value={paragraph}
                  />
                  <button
                    aria-label="Remove introduction paragraph"
                    className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={!canEdit || aboutForm.introParagraphs.length <= 1}
                    onClick={() => removeAboutListItem("introParagraphs", index)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={!canEdit || aboutForm.introParagraphs.length >= 4}
              onClick={() => addAboutListItem("introParagraphs", "New company introduction paragraph.")}
              type="button"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Paragraph
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">
              Commitment title
              <input
                className={fieldClass}
                disabled={!canEdit}
                onChange={(event) =>
                  setAboutForm({ ...aboutForm, commitmentTitle: event.target.value })
                }
                value={aboutForm.commitmentTitle}
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Commitment description
              <textarea
                className={`${fieldClass} min-h-24 py-3`}
                disabled={!canEdit}
                onChange={(event) =>
                  setAboutForm({ ...aboutForm, commitmentDescription: event.target.value })
                }
                value={aboutForm.commitmentDescription}
              />
            </label>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Mission and Vision
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 p-4">
                <label className="text-sm font-semibold text-slate-800">
                  Mission title
                  <input
                    className={fieldClass}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setAboutForm({ ...aboutForm, missionTitle: event.target.value })
                    }
                    value={aboutForm.missionTitle}
                  />
                </label>
                <label className="mt-3 block text-sm font-semibold text-slate-800">
                  Mission description
                  <textarea
                    className={`${fieldClass} min-h-28 py-3`}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setAboutForm({ ...aboutForm, missionDescription: event.target.value })
                    }
                    value={aboutForm.missionDescription}
                  />
                </label>
              </div>
              <div className="rounded-md border border-slate-200 p-4">
                <label className="text-sm font-semibold text-slate-800">
                  Vision title
                  <input
                    className={fieldClass}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setAboutForm({ ...aboutForm, visionTitle: event.target.value })
                    }
                    value={aboutForm.visionTitle}
                  />
                </label>
                <label className="mt-3 block text-sm font-semibold text-slate-800">
                  Vision description
                  <textarea
                    className={`${fieldClass} min-h-28 py-3`}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setAboutForm({ ...aboutForm, visionDescription: event.target.value })
                    }
                    value={aboutForm.visionDescription}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Core Values
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                ["valuesEyebrow", "Eyebrow"],
                ["valuesTitle", "Title"],
                ["valuesDescription", "Description"],
              ].map(([key, label]) => (
                <label className="text-sm font-semibold text-slate-800" key={key}>
                  {label}
                  <input
                    className={fieldClass}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setAboutForm({ ...aboutForm, [key]: event.target.value })
                    }
                    value={String(aboutForm[key as keyof AboutForm])}
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-3">
              {aboutForm.coreValues.map((value, index) => (
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]" key={`core-value-${index}`}>
                  <input
                    aria-label={`Core value ${index + 1}`}
                    className={fieldClass}
                    disabled={!canEdit}
                    onChange={(event) => updateAboutList("coreValues", index, event.target.value)}
                    value={value}
                  />
                  <button
                    aria-label="Remove core value"
                    className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={!canEdit || aboutForm.coreValues.length <= 1}
                    onClick={() => removeAboutListItem("coreValues", index)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={!canEdit || aboutForm.coreValues.length >= 8}
              onClick={() => addAboutListItem("coreValues", "New core value")}
              type="button"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Value
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Why Choose RRDS
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                ["whyEyebrow", "Eyebrow"],
                ["whyTitle", "Title"],
                ["whyDescription", "Description"],
              ].map(([key, label]) => (
                <label className="text-sm font-semibold text-slate-800" key={key}>
                  {label}
                  <input
                    className={fieldClass}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setAboutForm({ ...aboutForm, [key]: event.target.value })
                    }
                    value={String(aboutForm[key as keyof AboutForm])}
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {aboutForm.whyItems.map((item, index) => (
                <article className="rounded-md border border-slate-200 p-4" key={`why-${index}`}>
                  <div className="grid gap-3">
                    <input
                      aria-label={`Why choose item ${index + 1} title`}
                      className={fieldClass}
                      disabled={!canEdit}
                      onChange={(event) => updateAboutWhyItem(index, "title", event.target.value)}
                      value={item.title}
                    />
                    <textarea
                      aria-label={`Why choose item ${index + 1} description`}
                      className={`${fieldClass} min-h-24 py-3`}
                      disabled={!canEdit}
                      onChange={(event) =>
                        updateAboutWhyItem(index, "description", event.target.value)
                      }
                      value={item.description}
                    />
                    <button
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-red-300 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400 sm:w-fit"
                      disabled={!canEdit || aboutForm.whyItems.length <= 1}
                      onClick={() => removeAboutWhyItem(index)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <button
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={!canEdit || aboutForm.whyItems.length >= 6}
              onClick={addAboutWhyItem}
              type="button"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Reason
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">
              Final section title
              <input
                className={fieldClass}
                disabled={!canEdit}
                onChange={(event) =>
                  setAboutForm({ ...aboutForm, finalTitle: event.target.value })
                }
                value={aboutForm.finalTitle}
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Final section description
              <textarea
                className={`${fieldClass} min-h-24 py-3`}
                disabled={!canEdit}
                onChange={(event) =>
                  setAboutForm({ ...aboutForm, finalDescription: event.target.value })
                }
                value={aboutForm.finalDescription}
              />
            </label>
          </div>

          <button
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-fit"
            disabled={!canEdit || isSaving}
            onClick={() => void saveAboutPage()}
            type="button"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            {savingSection === "about" ? "Saving..." : "Save About Page"}
          </button>
        </div>
      </section>
      ) : null}

      {activeTab === "founder" ? (
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
                  disabled={!canEdit || isSaving}
                  onChange={(event) => void handleImageUpload(event.target.files?.[0])}
                  type="file"
                />
              </label>
              <button
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-red-300 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={!canEdit || isSaving || !settings?.founder.imageUrl}
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
                  disabled={!canEdit}
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
                  disabled={!canEdit}
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
                  disabled={!canEdit}
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
                  disabled={!canEdit}
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
                disabled={!canEdit}
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
                disabled={!canEdit}
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
                      disabled={!canEdit}
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
                  disabled={!canEdit}
                  onChange={(event) => setNewExpertise(event.target.value)}
                  placeholder="Add expertise"
                  value={newExpertise}
                />
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={!canEdit || !newExpertise.trim()}
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
              disabled={!canEdit || isSaving}
              onClick={() => void saveFounderProfile()}
              type="button"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              {savingSection === "founder" ? "Saving..." : "Save Founder Profile"}
            </button>
          </div>
        </div>
      </section>
      ) : null}
    </div>
  );
}
