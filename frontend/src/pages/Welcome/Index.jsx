import React, { useState, useEffect } from "react";
import Header from "../../components/layouts/Header";
import HeroSection from "../../components/Welcome/HeroSection";
import FeaturesSection from "../../components/Welcome/FeaturesSection";
import DevelopersSection from "../../components/Welcome/DevelopersSection";
import CTASection from "../../components/Welcome/CTASection";
import Loader from "../../components/layouts/Loader";

const Index = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader fullPage size="xl" />;
  }

  const features = [
    {
      id: 1,
      title: "Instant Verification",
      description: "Get your credentials verified in seconds using blockchain technology",
      icon: "⚡",
      color: "from-blue-500 to-cyan-500",
      details: "Our AI-powered system processes and verifies credentials instantly, providing real-time validation with 99.9% accuracy."
    },
    {
      id: 2,
      title: "Tamper-Proof Security",
      description: "Blockchain-secured certificates that cannot be forged or altered",
      icon: "🛡️",
      color: "from-green-500 to-emerald-500",
      details: "Every credential is secured with cryptographic hashing and distributed across our blockchain network for ultimate security."
    },
    {
      id: 3,
      title: "Easy Integration",
      description: "Simple API integration for institutions and platforms",
      icon: "🔧",
      color: "from-orange-500 to-red-500",
      details: "Integrate with your existing systems in minutes using our comprehensive API and developer tools."
    }
  ];

  const developers = [
    {
      name: "Rajesh Respall",
      role: "Backend Developer",
      expertise: "React, Node.js, Blockchain",
      image: "👨‍💻",
      bio: "Passionate about creating secure and scalable web applications with 3+ years in system development.",
      github: "rajrespall"
    },
 {
    "name": "Diana Carreon",
    "role": "UI/UX Lead Developer",
    "expertise": "Design Systems, Figma, User Research",
    "image": "👩‍🎨",
    "bio": "Crafting intuitive user experiences with a focus on accessibility and modern design principles.",
    "github": "dayaannaa"
  },
  {
    "name": "Mark Bartolome",
    "role": "UI/UX Developer",
    "expertise": "Wireframing, Prototyping, Design Collaboration",
    "image": "👨‍💻",
    "bio": "Supporting design workflows and implementing UI components under the guidance of the UX lead.",
    "github": "sadvoidhours"
  },
  {
    "name": "Miguel Dacumos",
    "role": "Full Stack Developer",
    "expertise": "Python, PostgreSQL, AWS",
    "image": "👨‍🔧",
    "bio": "Building robust APIs and database architectures for high-performance applications.",
    "github": "noellezzz"
  },
    {
      "name": "Dr. Rico Santos",
      "role": "Project Advisor & Mentor",
      "expertise": "Secure Software Development, Technical Project Guidance",
      "image": "👨‍🔒",
      "bio": "Providing strategic oversight and technical mentorship for blockchain-based credential systems",
      "github": "dimitrio25"
    }
  ];

return (
  <>
    <Header />
    <div
      className="min-h-screen pt-16"
      style={{
        background: "linear-gradient(135deg, var(--primary-color) 0%, #e6d9b8 100%)"
      }}
    >
      <HeroSection isVisible={isVisible} />
      <FeaturesSection
        features={features.map((feature, i) => ({
          ...feature,
          // Alternate between palette and complementary colors for cards
          color: i % 2 === 0
            ? "from-[var(--secondary-color)] to-[#b8a47e]"
            : "from-[var(--quaternary-color)] to-[#f7e7d3]"
        }))}
        activeCard={activeCard}
        setActiveCard={setActiveCard}
      />
      <DevelopersSection developers={developers} />
      <CTASection />

      <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
    </div>
  </>
);
}
export default Index;
