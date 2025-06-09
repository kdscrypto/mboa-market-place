
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ConseilsVendeurs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 theme-bg">
        <div className="mboa-container max-w-4xl mx-auto theme-bg-surface p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-mboa-orange mb-8">Conseils aux vendeurs</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 theme-text-primary">Maximisez vos ventes sur Mboa Market</h2>
              <p className="theme-text-secondary mb-4">
                Voici quelques conseils pour augmenter vos chances de vendre rapidement et au meilleur prix sur notre plateforme.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 theme-text-primary">Créez des annonces efficaces</h2>
              
              <div className="theme-bg-elevated p-6 rounded-lg mb-4">
                <h3 className="font-semibold mb-2 text-lg theme-text-primary">Rédigez des titres accrocheurs</h3>
                <p className="theme-text-secondary">
                  Un bon titre contient les mots-clés essentiels que les acheteurs recherchent. Mentionnez la marque, le modèle, 
                  et une caractéristique distinctive de votre produit.
                </p>
              </div>
              
              <div className="theme-bg-elevated p-6 rounded-lg mb-4">
                <h3 className="font-semibold mb-2 text-lg theme-text-primary">Soignez vos photos</h3>
                <p className="theme-text-secondary">
                  Prenez des photos claires et nettes sous un bon éclairage. Multipliez les angles de vue et 
                  n'hésitez pas à montrer les éventuels défauts pour gagner la confiance des acheteurs.
                </p>
              </div>
              
              <div className="theme-bg-elevated p-6 rounded-lg">
                <h3 className="font-semibold mb-2 text-lg theme-text-primary">Détaillez votre description</h3>
                <p className="theme-text-secondary">
                  Soyez précis et honnête dans votre description. Indiquez les caractéristiques techniques, 
                  l'état du produit, son âge, la raison de la vente et toute information pertinente qui pourrait 
                  intéresser un acheteur potentiel.
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 theme-text-primary">Fixez le bon prix</h2>
              <p className="theme-text-secondary mb-4">
                Recherchez des produits similaires sur la plateforme pour avoir une idée des prix du marché. 
                Un prix trop élevé découragera les acheteurs, tandis qu'un prix trop bas pourrait éveiller des soupçons.
              </p>
              <p className="theme-text-secondary">
                N'hésitez pas à mentionner que le prix est négociable si c'est le cas, cela peut attirer davantage d'acheteurs potentiels.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 theme-text-primary">Communiquez efficacement</h2>
              <ul className="list-disc pl-5 space-y-2 theme-text-secondary">
                <li>Répondez rapidement aux messages des acheteurs intéressés</li>
                <li>Restez courtois et professionnel dans vos échanges</li>
                <li>Soyez disponible pour organiser des visites ou des démonstrations</li>
                <li>N'hésitez pas à proposer des options de livraison si possible</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 theme-text-primary">Sécurisez vos transactions</h2>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                <h3 className="font-semibold mb-2 text-lg theme-text-primary">Conseils de sécurité</h3>
                <ul className="list-disc pl-5 space-y-2 theme-text-secondary">
                  <li>Privilégiez les rencontres en personne dans des lieux publics</li>
                  <li>Méfiez-vous des acheteurs qui ne veulent pas voir l'article avant de payer</li>
                  <li>Soyez prudent avec les paiements en ligne de personnes inconnues</li>
                  <li>Assurez-vous de la validité des moyens de paiement avant de livrer votre article</li>
                  <li>Établissez un reçu de vente pour les transactions importantes</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 theme-text-primary">Optez pour les options premium</h2>
              <p className="theme-text-secondary mb-4">
                Pour maximiser vos chances de vendre rapidement, n'hésitez pas à utiliser nos options d'annonces premium qui 
                permettent une meilleure visibilité de vos produits sur notre plateforme.
              </p>
              <a href="/premium" className="text-mboa-orange font-medium hover:underline">
                En savoir plus sur nos offres premium
              </a>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ConseilsVendeurs;
