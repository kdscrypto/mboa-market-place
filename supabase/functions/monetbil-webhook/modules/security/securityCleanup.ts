
export async function performSecurityCleanup(
  supabase: any
): Promise<{ success: boolean; results?: any; error?: string }> {
  try {
    const { data: cleanupResults, error } = await supabase
      .rpc('advanced_security_cleanup');

    if (error) {
      console.error('Security cleanup failed:', error);
      return { success: false, error: error.message };
    }

    console.log('Security cleanup completed:', cleanupResults);
    return { success: true, results: cleanupResults };
  } catch (error) {
    console.error('Security cleanup exception:', error);
    return { success: false, error: 'cleanup_exception' };
  }
}

export async function shouldPerformCleanup(): Promise<boolean> {
  // Simple logic to determine if cleanup should run
  // In production, this could check last cleanup time from a config table
  const lastCleanupTime = localStorage.getItem('last_security_cleanup');
  if (!lastCleanupTime) return true;
  
  const timeSinceLastCleanup = Date.now() - parseInt(lastCleanupTime);
  const oneDayInMs = 24 * 60 * 60 * 1000;
  
  return timeSinceLastCleanup > oneDayInMs;
}

export function markCleanupCompleted(): void {
  localStorage.setItem('last_security_cleanup', Date.now().toString());
}
