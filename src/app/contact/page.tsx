"use client";

import { useState } from "react";
import { FiInstagram, FiLinkedin, FiGithub, FiMail } from "react-icons/fi";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-white mb-4 tracking-tighter">Get in Touch</h1>
          <p className="text-gray-400 font-light text-lg">Whether for a collaboration, a project inquiry, or simply to say hello.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-white font-serif text-2xl mb-6 border-b border-white/10 pb-4">Social Presence</h3>
            
            <a href="https://www.instagram.com/jayg1____7/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-300 hover:text-accent transition-colors group">
              <div className="p-3 bg-card border border-white/10 rounded-full group-hover:border-accent/50 transition-colors">
                <FiInstagram className="w-5 h-5" />
              </div>
              <span className="font-light tracking-wide">Instagram</span>
            </a>
            
            <a href="https://www.linkedin.com/in/jaygurav" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-300 hover:text-accent transition-colors group">
              <div className="p-3 bg-card border border-white/10 rounded-full group-hover:border-accent/50 transition-colors">
                <FiLinkedin className="w-5 h-5" />
              </div>
              <span className="font-light tracking-wide">LinkedIn</span>
            </a>

            <a href="https://www.github.com/jaygurav" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-300 hover:text-accent transition-colors group">
              <div className="p-3 bg-card border border-white/10 rounded-full group-hover:border-accent/50 transition-colors">
                <FiGithub className="w-5 h-5" />
              </div>
              <span className="font-light tracking-wide">GitHub</span>
            </a>

            <a href="mailto:hello@jaygurav.com" className="flex items-center gap-4 text-gray-300 hover:text-accent transition-colors group">
              <div className="p-3 bg-card border border-white/10 rounded-full group-hover:border-accent/50 transition-colors">
                <FiMail className="w-5 h-5" />
              </div>
              <span className="font-light tracking-wide">hello@jaygurav.com</span>
            </a>
          </div>

          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="bg-card/50 p-8 rounded-2xl border border-white/10 glass">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold tracking-widest text-gray-400 uppercase mb-2">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors font-light"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold tracking-widest text-gray-400 uppercase mb-2">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors font-light"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold tracking-widest text-gray-400 uppercase mb-2">Message</label>
                  <textarea 
                    id="message" 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors font-light resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === "loading"}
                  className="w-full bg-white text-black font-semibold uppercase tracking-widest py-4 rounded-lg hover:bg-accent hover:text-white transition-colors duration-300 disabled:opacity-50"
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>

                {status === "success" && (
                  <p className="text-green-400 text-center text-sm font-light">Message sent successfully! I will be in touch shortly.</p>
                )}
                {status === "error" && (
                  <p className="text-red-400 text-center text-sm font-light">An error occurred. Please try emailing me directly.</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
