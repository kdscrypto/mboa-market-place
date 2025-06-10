
import { supabase } from '@/integrations/supabase/client';

export interface LygosConfig {
  id: string;
  api_key: string;
  base_url: string;
  webhook_url: string;
  return_url: string;
  cancel_url: string;
  environment: string;
  is_active: boolean;
}

export const getLygosConfig = async (): Promise<LygosConfig | null> => {
  try {
    const { data, error } = await supabase.rpc('get_active_lygos_config');
    
    if (error) {
      console.error('Error fetching Lygos configuration:', error);
      return null;
    }

    // Safely cast the data after validation
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as LygosConfig;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getLygosConfig:', error);
    return null;
  }
};

export const updateLygosConfig = async (config: Partial<LygosConfig>) => {
  try {
    const { data, error } = await supabase
      .from('lygos_configurations')
      .update(config)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Error updating Lygos configuration:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateLygosConfig:', error);
    return null;
  }
};

export const createLygosConfig = async (config: Omit<LygosConfig, 'id'>) => {
  try {
    // Désactiver toutes les autres configurations
    await supabase
      .from('lygos_configurations')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Créer la nouvelle configuration
    const { data, error } = await supabase
      .from('lygos_configurations')
      .insert(config)
      .select()
      .single();

    if (error) {
      console.error('Error creating Lygos configuration:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createLygosConfig:', error);
    return null;
  }
};
