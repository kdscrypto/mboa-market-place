
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-mboa-gray">
        <div className="mboa-container max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-mboa-orange mb-8">À propos de Mboa Market</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-3">Notre Vision</h2>
              <p className="text-gray-700">
                Mboa Market est né d'une vision simple : créer une plateforme de petites annonces moderne, 
                fiable et adaptée aux besoins spécifiques du Cameroun et de l'Afrique centrale. 
                Notre mission est de faciliter les transactions entre particuliers et professionnels, 
                en offrant un espace sécurisé et convivial pour acheter et vendre.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Notre Histoire</h2>
              <p className="text-gray-700">
                Fondé en 2023, Mboa Market est le fruit d'une collaboration entre entrepreneurs 
                camerounais et experts en technologie. Face aux défis rencontrés sur les plateformes 
                existantes, nous avons décidé de créer une solution à la fois simple, accessible et 
                performante, spécialement conçue pour le marché local.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Nos Valeurs</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>Confiance et sécurité</strong> - Nous mettons tout en œuvre pour créer un environnement de confiance pour nos utilisateurs.</li>
                <li><strong>Simplicité</strong> - Notre plateforme est conçue pour être intuitive et accessible à tous.</li>
                <li><strong>Innovation</strong> - Nous intégrons constamment de nouvelles fonctionnalités pour améliorer l'expérience utilisateur.</li>
                <li><strong>Proximité</strong> - Nous comprenons les besoins spécifiques du marché local et y adaptons nos services.</li>
                <li><strong>Inclusivité</strong> - Nous développons une plateforme accessible au plus grand nombre.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Notre Équipe</h2>
              <p className="text-gray-700">
                Mboa Market est porté par une équipe dynamique de professionnels passionnés par la technologie 
                et le développement économique local. Notre diversité de compétences nous permet d'offrir 
                une plateforme de qualité et un service client réactif.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Notre Engagement</h2>
              <p className="text-gray-700">
                Nous nous engageons à améliorer continuellement notre plateforme en fonction des 
                retours de nos utilisateurs. Votre satisfaction est notre priorité, et nous travaillons 
                chaque jour pour vous offrir la meilleure expérience possible.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
