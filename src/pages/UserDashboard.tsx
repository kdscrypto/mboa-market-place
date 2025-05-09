
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserDashboardTabs from "@/components/dashboard/UserDashboardTabs";

// Mock data - In a real app, these would come from Supabase
const userAds = [
  {
    id: "1",
    title: "Samsung Galaxy S21 Ultra - Comme neuf",
    price: 350000,
    status: "active",
    createdAt: "2023-05-15T12:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "2",
    title: "iPhone 13 Pro Max - 256GB",
    price: 450000,
    status: "sold",
    createdAt: "2023-04-10T14:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "3",
    title: "Ordinateur Portable HP Spectre",
    price: 650000,
    status: "expired",
    createdAt: "2023-03-22T09:15:00Z",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  },
];

const UserDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ads");
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/connexion");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-mboa-gray">
          <div className="mboa-container max-w-5xl">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center">Chargement...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-5xl">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Mon tableau de bord</h1>
              <Button 
                asChild 
                className="mt-4 md:mt-0 bg-mboa-orange hover:bg-mboa-orange/90"
              >
                <Link to="/publier-annonce">
                  Publier une nouvelle annonce
                </Link>
              </Button>
            </div>
            
            <UserDashboardTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              userAds={userAds}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
