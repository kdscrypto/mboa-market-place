
import { supabase } from "@/integrations/supabase/client";

export interface AdReport {
  id: string;
  ad_id: string;
  reported_by: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export const createAdReport = async (
  adId: string,
  reason: string,
  description?: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const { error } = await supabase
      .from('ad_reports')
      .insert({
        ad_id: adId,
        reported_by: user.id,
        reason,
        description: description?.trim() || null
      });

    if (error) {
      console.error("Erreur lors de la création du signalement:", error);
      return { success: false, error: "Erreur lors de la création du signalement" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Erreur lors de la création du signalement:", error);
    return { success: false, error: "Une erreur s'est produite" };
  }
};

export const fetchAdReports = async (
  status?: string,
  limit: number = 50,
  offset: number = 0
): Promise<AdReport[]> => {
  try {
    let query = supabase
      .from('ad_reports')
      .select(`
        *,
        ads(title, category),
        reported_by_profile:user_profiles!reported_by(id),
        reviewed_by_profile:user_profiles!reviewed_by(id)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur lors de la récupération des signalements:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des signalements:", error);
    return [];
  }
};

export const updateAdReportStatus = async (
  reportId: string,
  status: string,
  resolutionNotes?: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const updateData: any = {
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    };

    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes;
    }

    const { error } = await supabase
      .from('ad_reports')
      .update(updateData)
      .eq('id', reportId);

    if (error) {
      console.error("Erreur lors de la mise à jour du signalement:", error);
      return { success: false, error: "Erreur lors de la mise à jour du signalement" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du signalement:", error);
    return { success: false, error: "Une erreur s'est produite" };
  }
};
