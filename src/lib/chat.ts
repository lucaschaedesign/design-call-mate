
export interface Message {
  role: 'assistant' | 'user';
  content: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

export interface BookingData {
  businessName?: string;
  industry?: string;
  projectType?: string[];
  projectSize?: string;
  timeline?: string;
  budget?: string;
  meetingDate?: string;  // Added this property
  meetingTime?: string;  // Added this property
}

export const PREDEFINED_OPTIONS = {
  industries: [
    { label: 'E-commerce', value: 'ecommerce' },
    { label: 'Tech Startup', value: 'tech_startup' },
    { label: 'Health & Wellness', value: 'health_wellness' },
    { label: 'Education', value: 'education' },
    { label: 'Real Estate', value: 'real_estate' },
    { label: 'Other', value: 'other' }
  ],
  projectTypes: [
    { label: 'Branding', value: 'branding' },
    { label: 'Website UX/UI Design', value: 'website' },
    { label: 'Mobile App UX/UI Design', value: 'mobile_app' },
    { label: 'Marketing & Social Media Assets', value: 'marketing' },
    { label: 'Other', value: 'other' }
  ],
  projectSizes: [
    { label: 'Small (1-2 key pages/screens)', value: 'small' },
    { label: 'Medium (3-5 pages/screens)', value: 'medium' },
    { label: 'Large (Full brand & UX strategy)', value: 'large' },
    { label: 'Not sure', value: 'unsure' }
  ],
  timelines: [
    { label: 'ASAP (Within a week)', value: 'asap' },
    { label: '1-2 weeks', value: '1_2_weeks' },
    { label: '1 month', value: '1_month' },
    { label: 'Flexible / Not urgent', value: 'flexible' }
  ],
  budgets: [
    { label: 'Under $5K', value: 'under_5k' },
    { label: '$5K-$10K', value: '5k_10k' },
    { label: '$10K-$20K', value: '10k_20k' },
    { label: 'Not sure, need a quote', value: 'need_quote' }
  ]
};
