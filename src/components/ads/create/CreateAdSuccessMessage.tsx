
import React from "react";

const CreateAdSuccessMessage = () => {
  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Annonce soumise avec succès !</h2>
        <p className="text-gray-600">
          Votre annonce a été soumise pour approbation. Vous pouvez suivre son statut dans votre tableau de bord.
        </p>
      </div>
    </div>
  );
};

export default CreateAdSuccessMessage;
