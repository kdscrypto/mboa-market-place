
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Phone } from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  
  const whatsappNumber = "670381624";
  const siteEmail = "contact@mboamarket.com";

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct mailto URL
    const mailtoUrl = `mailto:${siteEmail}?subject=Message de ${name}&body=${encodeURIComponent(
      `Message de: ${name}\nEmail: ${email}\n\n${message}`
    )}`;
    
    // Open default email client
    window.location.href = mailtoUrl;
    
    toast.success("Ouverture de votre client email...");
  };

  const handleWhatsAppClick = () => {
    // Construct WhatsApp URL with pre-filled message
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `Bonjour, je vous contacte depuis le site Mboa Market.`
    )}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");
    
    toast.success("Ouverture de WhatsApp...");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-mboa-gray">
        <div className="mboa-container max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-mboa-orange mb-8">Contactez-nous</h1>
          
          <div className="space-y-8">
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Nos coordonnées</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Adresse</h3>
                  <p className="text-gray-700">
                    Mboa Market<br />
                    123 Rue de l'Innovation<br />
                    Douala, Cameroun
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Contact</h3>
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> {siteEmail}
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong>Téléphone:</strong> +237 {whatsappNumber}
                  </p>
                  
                  <Button 
                    onClick={handleWhatsAppClick}
                    className="bg-green-600 hover:bg-green-700 text-white w-full flex items-center justify-center gap-2"
                  >
                    <Phone size={18} /> Contacter par WhatsApp
                  </Button>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Envoyez-nous un message</h2>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom</Label>
                    <Input 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre email"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Votre message"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="bg-mboa-orange hover:bg-mboa-orange/90 text-white flex items-center gap-2"
                >
                  <Send size={18} /> Envoyer par email
                </Button>
              </form>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
