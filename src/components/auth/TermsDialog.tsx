
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsDialog: React.FC<TermsDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conditions Générales d'Utilisation</DialogTitle>
          <DialogDescription>
            Veuillez lire attentivement nos conditions d'utilisation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <h3 className="font-bold">1. ACCEPTATION DES CONDITIONS</h3>
          <p>
            En utilisant le site Mboa Market, vous acceptez intégralement et sans réserve les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.
          </p>

          <h3 className="font-bold">2. DESCRIPTION DU SERVICE</h3>
          <p>
            Mboa Market est une plateforme de petites annonces permettant aux utilisateurs de publier des offres de vente de biens et services. Mboa Market n'est pas partie aux transactions entre vendeurs et acheteurs et n'assume aucune responsabilité quant à la qualité, la sécurité ou la légalité des articles mis en vente.
          </p>

          <h3 className="font-bold">3. INSCRIPTION ET COMPTE UTILISATEUR</h3>
          <p>
            L'inscription est nécessaire pour publier des annonces. Vous vous engagez à fournir des informations exactes et à jour. Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité sous votre compte. Mboa Market se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes conditions.
          </p>

          <h3 className="font-bold">4. PUBLICATION D'ANNONCES</h3>
          <p>
            En publiant une annonce, vous garantissez que vous êtes le propriétaire légitime du bien ou que vous êtes autorisé à offrir le service proposé. Les annonces doivent être précises et ne pas contenir de contenu trompeur, illégal ou inapproprié. Mboa Market se réserve le droit de refuser ou supprimer toute annonce ne respectant pas ces conditions.
          </p>

          <h3 className="font-bold">5. CONTENU INTERDIT</h3>
          <p>
            Il est strictement interdit de publier des annonces pour des biens ou services illégaux, contrefaits, dangereux, ou violant les droits de propriété intellectuelle. Les contenus à caractère pornographique, diffamatoire, injurieux, menaçant ou discriminatoire sont également proscrits.
          </p>

          <h3 className="font-bold">6. RESPONSABILITÉ</h3>
          <p>
            Mboa Market n'est pas responsable des transactions entre utilisateurs. Nous vous encourageons à prendre toutes les précautions nécessaires lors de vos transactions (vérification des articles, rencontres dans des lieux publics, etc.). Mboa Market ne garantit pas la véracité des annonces publiées.
          </p>

          <h3 className="font-bold">7. PROPRIÉTÉ INTELLECTUELLE</h3>
          <p>
            Tout le contenu du site (logos, textes, graphiques, etc.) appartient à Mboa Market ou à ses partenaires. Toute reproduction sans autorisation préalable est interdite. En publiant une annonce, vous accordez à Mboa Market le droit d'utiliser les photos et descriptions fournies.
          </p>

          <h3 className="font-bold">8. DONNÉES PERSONNELLES</h3>
          <p>
            Mboa Market s'engage à protéger vos données personnelles conformément à la législation en vigueur. Consultez notre Politique de confidentialité pour plus d'informations sur la collecte et le traitement de vos données.
          </p>

          <h3 className="font-bold">9. MODIFICATION DES CONDITIONS</h3>
          <p>
            Mboa Market se réserve le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur le site. Il est de votre responsabilité de consulter régulièrement ces conditions.
          </p>

          <h3 className="font-bold">10. DROIT APPLICABLE</h3>
          <p>
            Ces conditions sont régies par les lois en vigueur au Cameroun. Tout litige relatif à leur interprétation ou exécution relève de la compétence des tribunaux camerounais.
          </p>

          <h3 className="font-bold">11. CONTACT</h3>
          <p>
            Pour toute question concernant ces conditions, veuillez nous contacter à l'adresse: support@mboamarket.com
          </p>
        </div>
        <Button onClick={() => onOpenChange(false)} className="mt-4">Fermer</Button>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;
