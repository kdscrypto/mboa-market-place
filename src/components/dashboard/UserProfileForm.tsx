
import React from "react";
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

interface UserProfileFormProps {
  user: any;
}

const UserProfileForm = ({ user }: UserProfileFormProps) => {
  const { toast } = useToast();

  const handleProfileUpdate = (data: any) => {
    // In a real app, this would connect to Supabase to update the user profile
    console.log("Update profile", data);
    toast({
      title: "Fonctionnalité à venir",
      description: "La mise à jour du profil sera implémentée avec Supabase.",
      duration: 3000
    });
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
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom d'utilisateur</label>
              <Input 
                value={user?.user_metadata?.username || ''}
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
                value={user?.user_metadata?.phone || ''}
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => handleProfileUpdate(user)}
          className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
        >
          Mettre à jour le profil
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfileForm;
