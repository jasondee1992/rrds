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
};
