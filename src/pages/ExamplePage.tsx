
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const ExamplePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F1117] text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Studio Eleven</div>
          <Button 
            variant="ghost" 
            className="text-white hover:text-white/80"
            onClick={() => navigate('/')}
          >
            Back to Platform
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-7xl font-bold mb-8 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            From Idea to Design in 3 Days
          </h1>
          <p className="text-xl text-white/80 mb-12">
            We transform your vision into pixel-perfect designs at lightning speed, 
            powered by our innovative AI-driven design process.
          </p>
          <Button 
            onClick={() => navigate('/chat-to-book')}
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 rounded-full"
          >
            Book a Discovery Call
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24 border-t border-white/10">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10 p-8 rounded-2xl">
            <Sparkles className="w-10 h-10 text-purple-400 mb-6" />
            <h3 className="text-xl font-semibold mb-4 text-white">AI-Powered Design</h3>
            <p className="text-white/80">
              Our AI algorithms help accelerate the design process without compromising quality.
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8 rounded-2xl">
            <Clock className="w-10 h-10 text-blue-400 mb-6" />
            <h3 className="text-xl font-semibold mb-4 text-white">3-Day Turnaround</h3>
            <p className="text-white/80">
              Get your designs in just 3 days, perfect for those tight deadlines.
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8 rounded-2xl">
            <CheckCircle className="w-10 h-10 text-green-400 mb-6" />
            <h3 className="text-xl font-semibold mb-4 text-white">Unlimited Revisions</h3>
            <p className="text-white/80">
              We'll iterate until you're completely satisfied with the results.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-white">Ready to Transform Your Idea?</h2>
          <p className="text-xl text-white/80 mb-12">
            Book a discovery call today and let's bring your vision to life.
          </p>
          <Button 
            onClick={() => navigate('/chat-to-book')}
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 rounded-full"
          >
            Book Your Call Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ExamplePage;
