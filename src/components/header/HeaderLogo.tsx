
import React from "react";
import { Link } from "react-router-dom";

const HeaderLogo: React.FC = () => {
  return (
    <Link to="/" className="text-xl font-bold">
      <span className="text-mboa-orange">Mboa</span>
      <span className="text-mboa-green"> Market</span>
    </Link>
  );
};

export default HeaderLogo;
