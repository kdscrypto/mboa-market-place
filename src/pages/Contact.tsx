
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
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
                    <strong>Email:</strong> contact@mboamarket.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Téléphone:</strong> +237 6XX XXX XXX
                  </p>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Formulaire de contact</h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mboa-orange" 
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mboa-orange" 
                      placeholder="Votre email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mboa-orange" 
                    placeholder="Sujet de votre message"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    rows={6} 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mboa-orange" 
                    placeholder="Votre message"
                  ></textarea>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="bg-mboa-orange hover:bg-mboa-orange/90 text-white py-3 px-6 rounded-md font-medium"
                  >
                    Envoyer le message
                  </button>
                </div>
              </form>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">Horaires d'ouverture</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Lundi - Vendredi:</strong> 9h - 17h
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Samedi:</strong> 10h - 15h
                </p>
                <p className="text-gray-700">
                  <strong>Dimanche:</strong> Fermé
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
