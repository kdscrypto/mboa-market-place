
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Help = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 theme-bg">
        <div className="mboa-container max-w-4xl mx-auto theme-bg-surface p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-mboa-orange mb-8">Centre d'Aide</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 theme-text-primary">Questions Fréquentes</h2>
              
              <div className="space-y-4">
                <div className="theme-bg-elevated p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 theme-text-primary">Comment créer un compte ?</h3>
                  <p className="theme-text-secondary">
                    Pour créer un compte, cliquez sur "S'inscrire" en haut à droite de la page. 
                    Remplissez le formulaire avec vos informations personnelles et suivez les instructions. 
                    Une confirmation vous sera envoyée par email.
                  </p>
                </div>
                
                <div className="theme-bg-elevated p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 theme-text-primary">Comment publier une annonce ?</h3>
                  <p className="theme-text-secondary">
                    Après vous être connecté, cliquez sur "Publier une annonce" en haut de la page. 
                    Remplissez le formulaire avec les détails de votre produit ou service, ajoutez des photos 
                    et cliquez sur "Publier". Votre annonce sera examinée puis mise en ligne.
                  </p>
                </div>
                
                <div className="theme-bg-elevated p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 theme-text-primary">Comment contacter un vendeur ?</h3>
                  <p className="theme-text-secondary">
                    Sur la page de l'annonce qui vous intéresse, vous trouverez les coordonnées du vendeur 
                    ou un formulaire de contact. Vous pouvez ainsi lui envoyer un message ou l'appeler directement.
                  </p>
                </div>
                
                <div className="theme-bg-elevated p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 theme-text-primary">Qu'est-ce qu'une annonce premium ?</h3>
                  <p className="theme-text-secondary">
                    Une annonce premium bénéficie d'une meilleure visibilité sur le site. 
                    Elle apparaît en haut des résultats de recherche et est mise en avant sur la page d'accueil. 
                    Pour rendre votre annonce premium, sélectionnez cette option lors de la publication.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 theme-text-primary">Guide de Sécurité</h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 theme-text-primary">Conseils pour les acheteurs</h3>
                <ul className="list-disc pl-5 space-y-1 theme-text-secondary">
                  <li>Privilégiez les rencontres dans des lieux publics</li>
                  <li>Vérifiez bien l'état de l'article avant l'achat</li>
                  <li>Méfiez-vous des prix anormalement bas</li>
                  <li>Ne versez jamais d'acompte sans avoir vu l'article</li>
                  <li>Signalez toute annonce suspecte à notre équipe</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                <h3 className="font-semibold mb-2 theme-text-primary">Conseils pour les vendeurs</h3>
                <ul className="list-disc pl-5 space-y-1 theme-text-secondary">
                  <li>Publiez des photos claires et détaillées de votre article</li>
                  <li>Décrivez précisément l'état et les caractéristiques de l'article</li>
                  <li>Fixez un prix juste et cohérent avec le marché</li>
                  <li>Restez disponible pour répondre aux questions</li>
                  <li>Privilégiez les paiements en espèces lors de la remise de l'article</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 theme-text-primary">Nous Contacter</h2>
              <p className="theme-text-secondary mb-4">
                Vous ne trouvez pas la réponse à votre question ? Notre équipe est à votre disposition :
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="theme-bg-elevated p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 theme-text-primary">Par email</h3>
                  <p className="theme-text-secondary">
                    support@mboamarket.com <br />
                    Réponse sous 24h ouvrées
                  </p>
                </div>
                
                <div className="theme-bg-elevated p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 theme-text-primary">Par téléphone</h3>
                  <p className="theme-text-secondary">
                    +237 670 381 624 <br />
                    Du lundi au vendredi de 9h à 17h
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Help;
