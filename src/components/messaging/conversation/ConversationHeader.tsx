
import React from "react";

interface ConversationHeaderProps {
  adTitle?: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ adTitle }) => {
  if (!adTitle) return null;

  return (
    <div className="px-4 py-3 flex items-center justify-center" style={{ backgroundColor: 'var(--messaging-main-bg)', borderBottom: '1px solid var(--messaging-border)' }}>
      <h3 className="font-medium text-sm" style={{ color: 'var(--messaging-text-primary)' }}>
        Annonce: {adTitle}
      </h3>
    </div>
  );
};

export default ConversationHeader;
