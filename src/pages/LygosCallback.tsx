
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LygosCallbackHandler from '@/components/payment/LygosCallbackHandler';

const LygosCallback = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <LygosCallbackHandler />
      </main>
      <Footer />
    </div>
  );
};

export default LygosCallback;
