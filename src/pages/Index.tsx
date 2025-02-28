
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FFFBEB] to-[#E8FFF8]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold">$</span>
          <span className="font-semibold">Print</span>
          <span className="font-semibold text-[#65B741]">Money</span>
          <span className="font-semibold">AI</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20">
        {/* Hero Section */}
        <div className="text-center max-w-6xl mx-auto mb-24">
          <h1 className="text-[64px] leading-tight font-medium mb-20">
            <span>Where </span>
            <span className="inline-block bg-[#FFFF66] px-8 py-2 rounded-full">
              Creativity
              <img 
                src="/creativity.png" 
                alt="Creativity icon" 
                className="inline-block ml-4 w-12 h-12"
              />
            </span>
            <span> Meets</span>
            <br />
            <span className="inline-block bg-[#98F6E4] px-8 py-2 rounded-full mt-4">
              Profitability
              <img 
                src="/profit.png" 
                alt="Profitability icon" 
                className="inline-block ml-4 w-12 h-12"
              />
            </span>
            <span> With AI</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Designs that don't just look good—they generate value.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={handleGoToDashboard}
              className="bg-[#333333] text-white hover:bg-[#444444] text-lg px-8 py-6 rounded-full"
            >
              Go to Your Dashboard
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <div className="text-[#65B741] mb-6">
              <img 
                src="/shape1.png" 
                alt="AI-driven icon" 
                className="w-8 h-8"
              />
            </div>
            <h3 className="text-2xl font-medium mb-4">AI-driven Onboarding</h3>
            <p className="text-gray-600">
              Let our AI assistant guide you through project planning with intelligent questions and suggestions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <div className="text-[#65B741] mb-6">
              <img 
                src="/shape2.png" 
                alt="Automated planning icon" 
                className="w-8 h-8"
              />
            </div>
            <h3 className="text-2xl font-medium mb-4">Automated Planning</h3>
            <p className="text-gray-600">
              Get instant project plans, timelines, and budgets based on your requirements.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <div className="text-[#65B741] mb-6">
              <img 
                src="/shape3.png" 
                alt="Smart scheduling icon" 
                className="w-8 h-8"
              />
            </div>
            <h3 className="text-2xl font-medium mb-4">Smart Scheduling</h3>
            <p className="text-gray-600">
              Book discovery calls at the perfect time, with automated follow-ups and reminders.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            © 2024 PrintMoneyAI. All rights reserved.
          </div>
          <Button
            variant="link"
            className="text-[#65B741] hover:text-[#75C751]"
            onClick={() => navigate('/example')}
          >
            View Example Agency Page
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Index;
