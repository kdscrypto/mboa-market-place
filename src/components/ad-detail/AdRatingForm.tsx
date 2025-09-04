import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRating } from "@/services/adRatingService";

interface AdRatingFormProps {
  userRating: UserRating | null;
  isSubmitting: boolean;
  onSubmit: (rating: number, comment?: string) => void;
  isOwner: boolean;
  isLoggedIn: boolean;
}

const AdRatingForm: React.FC<AdRatingFormProps> = ({
  userRating,
  isSubmitting,
  onSubmit,
  isOwner,
  isLoggedIn
}) => {
  const [selectedRating, setSelectedRating] = useState(userRating?.rating || 0);
  const [comment, setComment] = useState(userRating?.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);

  if (isOwner) {
    return null; // Owners can't rate their own ads
  }

  if (!isLoggedIn) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Connectez-vous pour évaluer cette annonce
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onSubmit(selectedRating, comment);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const isActive = star <= (hoveredRating || selectedRating);
      
      return (
        <button
          key={star}
          type="button"
          className="transition-transform hover:scale-110"
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setSelectedRating(star)}
        >
          <Star 
            className={`h-6 w-6 ${
              isActive 
                ? "fill-yellow-400 stroke-yellow-400" 
                : "fill-muted stroke-muted hover:stroke-yellow-400"
            }`} 
          />
        </button>
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {userRating ? "Modifier votre évaluation" : "Évaluer cette annonce"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Note :</span>
          <div className="flex">
            {renderStars()}
          </div>
          {selectedRating > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedRating}/5
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Commentaire (optionnel)</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec cette annonce..."
            className="min-h-[80px]"
          />
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={selectedRating === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Envoi..." : userRating ? "Mettre à jour" : "Publier l'évaluation"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdRatingForm;