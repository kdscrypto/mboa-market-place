
import React from "react";

interface AdStatusBadgeProps {
  status: string;
}

const AdStatusBadge: React.FC<AdStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "pending":
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">En attente</span>;
    case "approved":
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Approuvée</span>;
    case "rejected":
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejetée</span>;
    default:
      return null;
  }
};

export default AdStatusBadge;
