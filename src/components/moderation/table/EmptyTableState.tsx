
import React from "react";

interface EmptyTableStateProps {
  status: "pending" | "approved" | "rejected";
  isLoading: boolean;
}

const EmptyTableState: React.FC<EmptyTableStateProps> = ({ status, isLoading }) => {
  if (isLoading) {
    return <p className="text-center py-10">Chargement des annonces...</p>;
  }

  const messages = {
    pending: "Aucune annonce en attente de modération.",
    approved: "Aucune annonce approuvée.",
    rejected: "Aucune annonce rejetée."
  };

  return (
    <p className="text-center py-10 text-gray-500">
      {messages[status]}
    </p>
  );
};

export default EmptyTableState;
