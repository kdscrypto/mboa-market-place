
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface UserProfileFormProps {
  user: any;
}

const UserProfileForm = ({ user }: UserProfileFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.user_metadata?.username || '',
    phone: user?.user_metadata?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Mettre à jour les métadonnées de l'utilisateur
      const { data, error } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          phone: formData.phone,
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
        duration: 3000
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la mise à jour du profil.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil utilisateur</CardTitle>
        <CardDescription>
          Modifiez vos informations personnelles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom d'utilisateur</label>
              <Input 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nom d'utilisateur"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                value={user?.email || ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">L'email ne peut pas être modifié</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Téléphone</label>
              <Input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>
          
          <CardFooter className="px-0 pt-4">
            <Button 
              type="submit"
              className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : "Mettre à jour le profil"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
