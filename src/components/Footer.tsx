
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-mboa-dark text-white mt-12">
      <div className="mboa-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Présentation */}
          <div>
            <h3 className="text-xl font-bold mb-4">Mboa Market</h3>
            <p className="text-gray-300">
              La plateforme de petites annonces simple et efficace pour acheter et vendre au Cameroun.
            </p>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Liens Utiles</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/a-propos" className="text-gray-300 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/aide" className="text-gray-300 hover:text-white transition-colors">
                  Aide
                </Link>
              </li>
              <li>
                <Link to="/conditions" className="text-gray-300 hover:text-white transition-colors">
                  Conditions Générales
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Pour les annonceurs */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Pour les annonceurs</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/publier" className="text-gray-300 hover:text-white transition-colors">
                  Publier une annonce
                </Link>
              </li>
              <li>
                <Link to="/premium" className="text-gray-300 hover:text-white transition-colors">
                  Offres premium
                </Link>
              </li>
              <li>
                <Link to="/conseils-vendeurs" className="text-gray-300 hover:text-white transition-colors">
                  Conseils aux vendeurs
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Suivez-nous</h3>
            <div className="grid grid-cols-5 gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Facebook size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Instagram size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Twitter size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Linkedin size={24} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Youtube size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-300">
            &copy; {currentYear} Mboa Market. Tous droits réservés.
          </p>
          <p className="text-gray-300 mt-2">
            <span className="font-bold">built with <Heart className="inline-block text-red-500" size={16} fill="red" /> by KDS</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
