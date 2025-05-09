
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
});

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  phone: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions générales d'utilisation" })
  })
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Login = () => {
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      phone: "",
      acceptTerms: false
    }
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });
      
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          duration: 3000
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
        duration: 3000
      });
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion.",
        duration: 3000
      });
    }
  };
  
  const handleRegister = async (values: RegisterFormValues) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            phone: values.phone || null
          }
        }
      });
      
      if (authError) {
        toast({
          title: "Erreur d'inscription",
          description: authError.message,
          duration: 3000
        });
        return;
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Veuillez vérifier votre email pour confirmer votre compte.",
        duration: 5000
      });
      navigate("/");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'inscription.",
        duration: 3000
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 bg-mboa-gray">
        <div className="mboa-container max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Connexion</CardTitle>
                  <CardDescription>
                    Connectez-vous à votre compte Mboa Market
                  </CardDescription>
                </CardHeader>
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="votre@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Mot de passe</FormLabel>
                              <Link to="/mot-de-passe-oublie" className="text-xs text-mboa-orange hover:underline">
                                Mot de passe oublié?
                              </Link>
                            </div>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
                      >
                        Se connecter
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Inscription</CardTitle>
                  <CardDescription>
                    Créez un compte pour publier des annonces
                  </CardDescription>
                </CardHeader>
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="votre@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom d'utilisateur</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Votre pseudo"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone (optionnel)</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="6XXXXXXXX"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-gray-500 mt-1">
                              Le mot de passe doit contenir au moins 6 caractères.
                            </p>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <div className="text-sm text-muted-foreground">
                                J'accepte les{" "}
                                <button
                                  type="button"
                                  className="text-mboa-orange hover:underline font-medium"
                                  onClick={() => setIsTermsDialogOpen(true)}
                                >
                                  conditions générales d'utilisation
                                </button>
                              </div>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
                      >
                        Créer un compte
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Conditions Générales d'Utilisation</DialogTitle>
                <DialogDescription>
                  Veuillez lire attentivement nos conditions d'utilisation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <h3 className="font-bold">1. ACCEPTATION DES CONDITIONS</h3>
                <p>
                  En utilisant le site Mboa Market, vous acceptez intégralement et sans réserve les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.
                </p>

                <h3 className="font-bold">2. DESCRIPTION DU SERVICE</h3>
                <p>
                  Mboa Market est une plateforme de petites annonces permettant aux utilisateurs de publier des offres de vente de biens et services. Mboa Market n'est pas partie aux transactions entre vendeurs et acheteurs et n'assume aucune responsabilité quant à la qualité, la sécurité ou la légalité des articles mis en vente.
                </p>

                <h3 className="font-bold">3. INSCRIPTION ET COMPTE UTILISATEUR</h3>
                <p>
                  L'inscription est nécessaire pour publier des annonces. Vous vous engagez à fournir des informations exactes et à jour. Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité sous votre compte. Mboa Market se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes conditions.
                </p>

                <h3 className="font-bold">4. PUBLICATION D'ANNONCES</h3>
                <p>
                  En publiant une annonce, vous garantissez que vous êtes le propriétaire légitime du bien ou que vous êtes autorisé à offrir le service proposé. Les annonces doivent être précises et ne pas contenir de contenu trompeur, illégal ou inapproprié. Mboa Market se réserve le droit de refuser ou supprimer toute annonce ne respectant pas ces conditions.
                </p>

                <h3 className="font-bold">5. CONTENU INTERDIT</h3>
                <p>
                  Il est strictement interdit de publier des annonces pour des biens ou services illégaux, contrefaits, dangereux, ou violant les droits de propriété intellectuelle. Les contenus à caractère pornographique, diffamatoire, injurieux, menaçant ou discriminatoire sont également proscrits.
                </p>

                <h3 className="font-bold">6. RESPONSABILITÉ</h3>
                <p>
                  Mboa Market n'est pas responsable des transactions entre utilisateurs. Nous vous encourageons à prendre toutes les précautions nécessaires lors de vos transactions (vérification des articles, rencontres dans des lieux publics, etc.). Mboa Market ne garantit pas la véracité des annonces publiées.
                </p>

                <h3 className="font-bold">7. PROPRIÉTÉ INTELLECTUELLE</h3>
                <p>
                  Tout le contenu du site (logos, textes, graphiques, etc.) appartient à Mboa Market ou à ses partenaires. Toute reproduction sans autorisation préalable est interdite. En publiant une annonce, vous accordez à Mboa Market le droit d'utiliser les photos et descriptions fournies.
                </p>

                <h3 className="font-bold">8. DONNÉES PERSONNELLES</h3>
                <p>
                  Mboa Market s'engage à protéger vos données personnelles conformément à la législation en vigueur. Consultez notre Politique de confidentialité pour plus d'informations sur la collecte et le traitement de vos données.
                </p>

                <h3 className="font-bold">9. MODIFICATION DES CONDITIONS</h3>
                <p>
                  Mboa Market se réserve le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur le site. Il est de votre responsabilité de consulter régulièrement ces conditions.
                </p>

                <h3 className="font-bold">10. DROIT APPLICABLE</h3>
                <p>
                  Ces conditions sont régies par les lois en vigueur au Cameroun. Tout litige relatif à leur interprétation ou exécution relève de la compétence des tribunaux camerounais.
                </p>

                <h3 className="font-bold">11. CONTACT</h3>
                <p>
                  Pour toute question concernant ces conditions, veuillez nous contacter à l'adresse: support@mboamarket.com
                </p>
              </div>
              <Button onClick={() => setIsTermsDialogOpen(false)} className="mt-4">Fermer</Button>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
