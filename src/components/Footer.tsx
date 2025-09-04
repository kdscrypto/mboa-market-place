
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Heart } from "lucide-react";
import AdsterraBanner from "./ads/AdsterraBanner";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <>
      {/* Footer banner ad */}
      <div className="border-t">
        <AdsterraBanner 
          zoneId="footer-banner-1" 
          format="banner"
          style={{ width: "100%", height: "250px" }}
          className="my-4"
        />
      </div>
      
      <footer className="theme-bg-surface theme-text-primary border-t theme-border mt-6">
      <div className="mboa-container py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Présentation */}
          <div>
            <h3 className="text-lg font-bold mb-3 theme-text-primary">Mboa Market</h3>
            <p className="theme-text-secondary text-sm">
              La plateforme de petites annonces simple et efficace pour acheter et vendre au Cameroun.
            </p>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-base font-semibold mb-2 theme-text-primary">Liens Utiles</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/about" className="theme-text-secondary hover:text-mboa-orange transition-colors text-sm">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/help" className="theme-text-secondary hover:text-mboa-orange transition-colors text-sm">
                  Aide
                </Link>
              </li>
              <li>
                <Link to="/terms" className="theme-text-secondary hover:text-mboa-orange transition-colors text-sm">
                  Conditions Générales
                </Link>
              </li>
              <li>
                <Link to="/contact" className="theme-text-secondary hover:text-mboa-orange transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Pour les annonceurs */}
          <div>
            <h3 className="text-base font-semibold mb-2 theme-text-primary">Pour les annonceurs</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/publier" className="theme-text-secondary hover:text-mboa-orange transition-colors text-sm">
                  Publier une annonce
                </Link>
              </li>
              <li>
                <Link to="/premium-ads" className="theme-text-secondary hover:text-mboa-orange transition-colors text-sm">
                  Offres premium
                </Link>
              </li>
              <li>
                <Link to="/conseils-vendeurs" className="theme-text-secondary hover:text-mboa-orange transition-colors text-sm">
                  Conseils aux vendeurs
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-base font-semibold mb-2 theme-text-primary">Suivez-nous</h3>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="theme-text-secondary hover:text-mboa-orange transition-colors"
                aria-label="Suivez-nous sur Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="theme-text-secondary hover:text-mboa-orange transition-colors"
                aria-label="Suivez-nous sur Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="theme-text-secondary hover:text-mboa-orange transition-colors"
                aria-label="Suivez-nous sur Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="theme-text-secondary hover:text-mboa-orange transition-colors"
                aria-label="Suivez-nous sur LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="theme-text-secondary hover:text-mboa-orange transition-colors"
                aria-label="Suivez-nous sur YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t theme-border mt-4 pt-4 text-center">
          <p className="theme-text-secondary text-sm">
            &copy; {currentYear} Mboa Market. Tous droits réservés.
          </p>
          <div className="mt-2">
            <p className="text-xs theme-text-secondary opacity-60">
              <span>built with <Heart className="inline-block text-red-500" size={10} fill="red" /> by KDS</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
