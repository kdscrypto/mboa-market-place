import { supabase } from "@/integrations/supabase/client";

export interface AdReportSubmission {
  reason: string;
  description: string;
}

export const REPORT_REASONS = [
  { value: "inappropriate_content", label: "Contenu inapproprié" },
  { value: "suspected_scam", label: "Arnaque suspectée" },
  { value: "false_information", label: "Informations fausses" },
  { value: "spam_duplicate", label: "Spam/Duplicate" },
  { value: "other", label: "Autres" }
] as const;

export const adReportService = {
  async submitReport(adId: string, reportData: AdReportSubmission): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('ad_reports')
      .insert({
        ad_id: adId,
        reported_by: user.user.id,
        reason: reportData.reason,
        description: reportData.description,
        status: 'pending'
      });

    if (error) throw error;
  },

  async checkUserReport(adId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('ad_reports')
      .select('id')
      .eq('ad_id', adId)
      .eq('reported_by', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
};