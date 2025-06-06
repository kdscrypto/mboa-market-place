
import { supabase } from "@/integrations/supabase/client";

// Upload attachment to storage
export const uploadAttachment = async (file: File, conversationId: string): Promise<string> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error("Utilisateur non authentifié");
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${userData.user.id}/${conversationId}/${Date.now()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from('message_attachments')
    .upload(fileName, file);

  if (error) {
    console.error("Erreur lors de l'upload de la pièce jointe:", error);
    throw new Error("Erreur lors de l'upload de la pièce jointe");
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('message_attachments')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};
