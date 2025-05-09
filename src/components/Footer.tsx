
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-mboa-dark text-white mt-12">
      <div className="mboa-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Mboa Market</h3>
            <p className="text-gray-300">
              La plateforme de petites annonces simple et efficace pour acheter et vendre au Cameroun.
            </p>
          </div>

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
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">
                Email: contact@mboamarket.com
              </li>
              <li className="text-gray-300">
                Téléphone: +237 6XX XXX XXX
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-300">
            &copy; {currentYear} Mboa Market. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
