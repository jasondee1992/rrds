export type SiteSettings = {
  company: {
    name: string;
    contactNumber: string;
    email: string;
    address: string;
  };
  socialLinks: {
    facebook?: string;
    linkedin?: string;
  };
  founder: {
    name: string;
    role: string;
    experienceYears: string;
    currentResponsibility: string;
    shortBiography: string;
    fullBiography: string;
    imageUrl?: string;
    expertise: string[];
  };
  home: {
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
    carouselImages: Array<{
      id?: string;
      imageUrl: string;
      altText: string;
      caption?: string;
      sortOrder: number;
    }>;
  };
  services: Array<{
    key: string;
    name: string;
    summary: string;
    description: string;
    imageUrl?: string;
    sortOrder: number;
    isActive: boolean;
  }>;
  about: {
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
};
