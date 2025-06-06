
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MessagesAuthCheck from "@/components/messaging/MessagesAuthCheck";
import MessagesContent from "@/components/messaging/MessagesContent";

const Messages: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow mboa-container py-6">
        <MessagesAuthCheck>
          <MessagesContent />
        </MessagesAuthCheck>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
