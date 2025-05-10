
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, User, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CommandDialog, 
  CommandInput, 
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up keyboard shortcut for command menu
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);
      setUsername(session?.user?.user_metadata?.username || null);
      
      // Vérifier si l'utilisateur est admin
      if (loggedIn) {
        checkIfAdmin();
      } else {
        setIsAdmin(false);
      }
    });

    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUsername(session?.user?.user_metadata?.username || null);
      
      // Vérifier si l'utilisateur est admin
      if (session) {
        checkIfAdmin();
      }
    };
    
    const checkIfAdmin = async () => {
      try {
        console.log("Header: Checking admin status...");
        const { data: isUserAdmin, error } = await supabase.rpc('is_admin_or_moderator');
        
        if (error) {
          console.error("Erreur lors de la vérification des droits admin:", error);
          return;
        }
        
        console.log("Header: Admin check result:", isUserAdmin);
        setIsAdmin(isUserAdmin || false);
      } catch (err) {
        console.error("Erreur lors de la vérification des droits admin:", err);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
        duration: 3000
      });
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion.",
        duration: 3000
      });
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (searchValue.trim()) {
      // Close mobile menu if open
      setMobileMenuOpen(false);
      // Close command menu if open
      setCommandOpen(false);
      
      // Navigate to search page with the query
      navigate(`/recherche?query=${encodeURIComponent(searchValue.trim())}`);
      
      // Clear search input
      setSearchValue("");
    }
  };

  const handleCommandSelect = (value: string) => {
    setCommandOpen(false);
    
    if (value.startsWith("category:")) {
      const categoryId = value.replace("category:", "");
      navigate(`/recherche?category=${categoryId}`);
    } else if (value.startsWith("region:")) {
      const regionId = value.replace("region:", "");
      navigate(`/recherche?region=${regionId}`);
    } else if (value === "create-ad") {
      navigate("/publier-annonce");
    } else if (value === "login") {
      navigate("/connexion");
    } else if (value === "dashboard") {
      navigate("/mes-annonces");
    } else if (value === "moderation") {
      navigate("/admin/moderation");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mboa-container py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-mboa-orange">
              Mboa<span className="text-mboa-green">Market</span>
            </h1>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 mx-6">
            <div className="relative w-full max-w-xl">
              <form onSubmit={handleSearchSubmit}>
                <Input
                  type="text"
                  placeholder="Rechercher une annonce... (Ctrl + K)"
                  className="pl-10 pr-4 mboa-input"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setCommandOpen(true)}
                />
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  size={18} 
                />
              </form>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              asChild 
              className="bg-mboa-orange hover:bg-mboa-orange/90 text-white"
            >
              <Link to="/publier-annonce">Publier une annonce</Link>
            </Button>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button 
                    asChild 
                    variant="outline"
                  >
                    <Link to="/admin/moderation">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Modération
                    </Link>
                  </Button>
                )}
                <Button 
                  asChild 
                  variant="outline"
                >
                  <Link to="/mes-annonces">
                    {username ? `Bonjour, ${username}` : "Mon compte"}
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                asChild 
                variant="outline"
              >
                <Link to="/connexion">Connexion / Inscription</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search - Always visible on mobile */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <form onSubmit={handleSearchSubmit}>
              <Input
                type="text"
                placeholder="Rechercher une annonce..."
                className="pl-10 pr-4 mboa-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-3 animate-fade-in">
            <nav className="flex flex-col space-y-3">
              <Button 
                asChild 
                className="bg-mboa-orange hover:bg-mboa-orange/90 text-white w-full"
              >
                <Link to="/publier-annonce">Publier une annonce</Link>
              </Button>
              
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <Link to="/admin/moderation">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Modération
                      </Link>
                    </Button>
                  )}
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full"
                  >
                    <Link to="/mes-annonces">Mon tableau de bord</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                >
                  <Link to="/connexion">Connexion / Inscription</Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Command Menu */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput 
          placeholder="Rechercher une annonce, une catégorie..." 
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
          
          {searchValue && (
            <CommandGroup heading="Recherche">
              <CommandItem 
                onSelect={() => handleSearchSubmit()}
                className="cursor-pointer"
              >
                <Search className="mr-2 h-4 w-4" />
                Rechercher "{searchValue}"
              </CommandItem>
            </CommandGroup>
          )}
          
          <CommandGroup heading="Catégories">
            {categories.slice(0, 7).map(category => (
              <CommandItem 
                key={category.id} 
                value={`category:${category.id}`}
                onSelect={handleCommandSelect}
                className="cursor-pointer"
              >
                <span className="text-sm">{category.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandGroup heading="Régions">
            {regions.slice(0, 7).map(region => (
              <CommandItem 
                key={region.id} 
                value={`region:${region.id}`}
                onSelect={handleCommandSelect}
                className="cursor-pointer"
              >
                <span className="text-sm">{region.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandGroup heading="Actions rapides">
            <CommandItem 
              value="create-ad"
              onSelect={handleCommandSelect}
              className="cursor-pointer"
            >
              <span className="text-sm">Publier une annonce</span>
            </CommandItem>
            
            {!isLoggedIn ? (
              <CommandItem 
                value="login"
                onSelect={handleCommandSelect}
                className="cursor-pointer"
              >
                <span className="text-sm">Connexion / Inscription</span>
              </CommandItem>
            ) : (
              <>
                <CommandItem 
                  value="dashboard"
                  onSelect={handleCommandSelect}
                  className="cursor-pointer"
                >
                  <span className="text-sm">Mon tableau de bord</span>
                </CommandItem>
                
                {isAdmin && (
                  <CommandItem 
                    value="moderation"
                    onSelect={handleCommandSelect}
                    className="cursor-pointer"
                  >
                    <span className="text-sm">Modération</span>
                  </CommandItem>
                )}
              </>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

// Mock data - Same as used in SearchFilters
const categories = [
  { id: 0, name: 'Toutes les catégories', slug: 'all' },
  { id: 1, name: 'Électronique', slug: 'electronique' },
  { id: 2, name: 'Véhicules', slug: 'vehicules' },
  { id: 3, name: 'Immobilier', slug: 'immobilier' },
  { id: 4, name: 'Vêtements', slug: 'vetements' },
  { id: 5, name: 'Services', slug: 'services' },
  { id: 6, name: 'Emploi', slug: 'emploi' },
];

const regions = [
  { id: 0, name: 'Tout le Cameroun', slug: 'all' },
  { id: 1, name: 'Littoral', slug: 'littoral' },
  { id: 2, name: 'Centre', slug: 'centre' },
  { id: 3, name: 'Ouest', slug: 'ouest' },
  { id: 4, name: 'Sud-Ouest', slug: 'sud-ouest' },
  { id: 5, name: 'Nord-Ouest', slug: 'nord-ouest' },
  { id: 6, name: 'Est', slug: 'est' },
  { id: 7, name: 'Adamaoua', slug: 'adamaoua' },
  { id: 8, name: 'Nord', slug: 'nord' },
  { id: 9, name: 'Extrême-Nord', slug: 'extreme-nord' },
  { id: 10, name: 'Sud', slug: 'sud' },
];

export default Header;
