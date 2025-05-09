
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-mboa-gray">
        <div className="mboa-container max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-mboa-orange mb-8">Conditions Générales d'Utilisation</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-3">1. ACCEPTATION DES CONDITIONS</h2>
              <p className="text-gray-700">
                En utilisant le site Mboa Market, vous acceptez intégralement et sans réserve les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">2. DESCRIPTION DU SERVICE</h2>
              <p className="text-gray-700">
                Mboa Market est une plateforme de petites annonces permettant aux utilisateurs de publier des offres de vente de biens et services. Mboa Market n'est pas partie aux transactions entre vendeurs et acheteurs et n'assume aucune responsabilité quant à la qualité, la sécurité ou la légalité des articles mis en vente.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">3. INSCRIPTION ET COMPTE UTILISATEUR</h2>
              <p className="text-gray-700">
                L'inscription est nécessaire pour publier des annonces. Vous vous engagez à fournir des informations exactes et à jour. Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité sous votre compte. Mboa Market se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes conditions.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">4. PUBLICATION D'ANNONCES</h2>
              <p className="text-gray-700">
                En publiant une annonce, vous garantissez que vous êtes le propriétaire légitime du bien ou que vous êtes autorisé à offrir le service proposé. Les annonces doivent être précises et ne pas contenir de contenu trompeur, illégal ou inapproprié. Mboa Market se réserve le droit de refuser ou supprimer toute annonce ne respectant pas ces conditions.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">5. CONTENU INTERDIT</h2>
              <p className="text-gray-700">
                Il est strictement interdit de publier des annonces pour des biens ou services illégaux, contrefaits, dangereux, ou violant les droits de propriété intellectuelle. Les contenus à caractère pornographique, diffamatoire, injurieux, menaçant ou discriminatoire sont également proscrits.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">6. RESPONSABILITÉ</h2>
              <p className="text-gray-700">
                Mboa Market n'est pas responsable des transactions entre utilisateurs. Nous vous encourageons à prendre toutes les précautions nécessaires lors de vos transactions (vérification des articles, rencontres dans des lieux publics, etc.). Mboa Market ne garantit pas la véracité des annonces publiées.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">7. PROPRIÉTÉ INTELLECTUELLE</h2>
              <p className="text-gray-700">
                Tout le contenu du site (logos, textes, graphiques, etc.) appartient à Mboa Market ou à ses partenaires. Toute reproduction sans autorisation préalable est interdite. En publiant une annonce, vous accordez à Mboa Market le droit d'utiliser les photos et descriptions fournies.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">8. DONNÉES PERSONNELLES</h2>
              <p className="text-gray-700">
                Mboa Market s'engage à protéger vos données personnelles conformément à la législation en vigueur. Consultez notre Politique de confidentialité pour plus d'informations sur la collecte et le traitement de vos données.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">9. MODIFICATION DES CONDITIONS</h2>
              <p className="text-gray-700">
                Mboa Market se réserve le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur le site. Il est de votre responsabilité de consulter régulièrement ces conditions.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">10. DROIT APPLICABLE</h2>
              <p className="text-gray-700">
                Ces conditions sont régies par les lois en vigueur au Cameroun. Tout litige relatif à leur interprétation ou exécution relève de la compétence des tribunaux camerounais.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">11. CONTACT</h2>
              <p className="text-gray-700">
                Pour toute question concernant ces conditions, veuillez nous contacter à l'adresse: support@mboamarket.com
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
