
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate next 5 business days (excluding weekends)
function getNextBusinessDays(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  let currentDate = today;

  while (dates.length < count) {
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
      const month = currentDate.toLocaleString('en-US', { month: 'short' });
      const day = currentDate.getDate();
      const weekday = currentDate.toLocaleString('en-US', { weekday: 'short' });
      const isoDate = currentDate.toISOString().split('T')[0];
      dates.push({ label: `${weekday}, ${month} ${day}`, value: isoDate });
    }
  }
  
  return dates;
}

// Define the options directly in the edge function
const PREDEFINED_OPTIONS = {
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
  ],
  dates: [
    ...getNextBusinessDays(5),
    { label: 'Custom Date', value: 'custom' }
  ],
  times: [
    { label: '9:00 AM', value: '09:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '4:00 PM', value: '16:00' },
    { label: 'Custom Time', value: 'custom' }
  ]
};

const CONVERSATION_STEPS = [
  { field: 'businessName', question: "What's your business name?" },
  { 
    field: 'industry',
    question: "What industry is your business in?",
    options: PREDEFINED_OPTIONS.industries
  },
  {
    field: 'projectType',
    question: "What kind of design do you need?",
    options: PREDEFINED_OPTIONS.projectTypes
  },
  {
    field: 'projectSize',
    question: "How big is this project?",
    options: PREDEFINED_OPTIONS.projectSizes
  },
  {
    field: 'timeline',
    question: "When do you need this project completed?",
    options: PREDEFINED_OPTIONS.timelines
  },
  {
    field: 'budget',
    question: "Do you have a budget range in mind?",
    options: PREDEFINED_OPTIONS.budgets
  },
  {
    field: 'meetingDate',
    question: "Great! Let's schedule your discovery call. What date works best for you?",
    options: PREDEFINED_OPTIONS.dates,
    allowCustom: true
  },
  {
    field: 'meetingTime',
    question: "And what time would you prefer? (All times in EST)",
    options: PREDEFINED_OPTIONS.times,
    allowCustom: true
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, bookingData } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const currentStep = determineCurrentStep(bookingData);

    // Process user's response and update booking data
    const updatedBookingData = processUserResponse(lastMessage.content, currentStep, bookingData);

    // Get next question and options
    const nextStep = CONVERSATION_STEPS[Object.keys(updatedBookingData).length];
    let responseMessage, options;

    if (nextStep) {
      responseMessage = nextStep.question;
      options = nextStep.options;
    } else {
      // All questions answered, proceed to confirmation
      responseMessage = `Perfect! I've scheduled your discovery call for ${updatedBookingData.meetingDate} at ${updatedBookingData.meetingTime} EST. You'll receive a calendar invite shortly.`;
    }

    return new Response(
      JSON.stringify({
        message: responseMessage,
        options,
        bookingData: updatedBookingData,
        completed: !nextStep
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function determineCurrentStep(bookingData: any) {
  return CONVERSATION_STEPS[Object.keys(bookingData).length];
}

function processUserResponse(content: string, currentStep: any, bookingData: any) {
  if (!currentStep) return bookingData;

  const updatedData = { ...bookingData };
  updatedData[currentStep.field] = content;
  return updatedData;
}
