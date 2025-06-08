import React from "react";

const CTASection = () => {
  return (
    <footer className="bg-gradient-to-r from-[#37421b] via-[var(--secondary-color)] to-[#b8a47e] text-[var(--secondary-color)]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6 text-[var(--primary-color)]">Ready to Get Started?</h2>
          <p className="text-xl text-[var(--primary-color)] mb-8 max-w-2xl mx-auto">
            Join Credify for your credential verification needs.
          </p>
        </div>
        
        <div className="border-t border-[var(--quaternary-color)] pt-8 text-center">
          <p className="text-[var(--primary-color)]">
            © 2025 Credify. All rights reserved. | Secure credential verification powered by blockchain technology.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CTASection;