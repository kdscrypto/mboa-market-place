
import React from "react";

interface ConversationHeaderProps {
  adTitle?: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ adTitle }) => {
  if (!adTitle) return null;

  return (
    <div className="bg-white p-3 border-b">
      <h3 className="font-medium text-sm">Annonce: {adTitle}</h3>
    </div>
  );
};

export default ConversationHeader;
