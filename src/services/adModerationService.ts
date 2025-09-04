import { supabase } from "@/integrations/supabase/client";

/**
 * Service pour la modération des annonces
 * Gère la suppression et le masquage des annonces
 */

/**
 * Marque une annonce comme supprimée (soft delete)
 * L'annonce reste dans la base de données mais n'est plus visible publiquement
 */
export const markAdAsDeleted = async (adId: string, reason?: string): Promise<boolean> => {
  try {
    console.log(`Marking ad ${adId} as deleted. Reason: ${reason || 'No reason provided'}`);
    
    const { error } = await supabase
      .from('ads')
      .update({ 
        status: 'deleted',
        reject_reason: reason || 'Annonce supprimée',
        updated_at: new Date().toISOString()
      })
      .eq('id', adId);

    if (error) {
      console.error('Error marking ad as deleted:', error);
      return false;
    }

    console.log(`Ad ${adId} successfully marked as deleted`);
    return true;
  } catch (error) {
    console.error('Error in markAdAsDeleted:', error);
    return false;
  }
};

/**
 * Restaure une annonce supprimée (la remet en pending pour re-modération)
 */
export const restoreDeletedAd = async (adId: string): Promise<boolean> => {
  try {
    console.log(`Restoring deleted ad ${adId}`);
    
    const { error } = await supabase
      .from('ads')
      .update({ 
        status: 'pending',
        reject_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', adId)
      .eq('status', 'deleted');

    if (error) {
      console.error('Error restoring ad:', error);
      return false;
    }

    console.log(`Ad ${adId} successfully restored`);
    return true;
  } catch (error) {
    console.error('Error in restoreDeletedAd:', error);
    return false;
  }
};

/**
 * Vérifie si une annonce est visible pour le public
 */
export const isAdVisible = async (adId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('status')
      .eq('id', adId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.status === 'approved';
  } catch (error) {
    console.error('Error checking ad visibility:', error);
    return false;
  }
};