
export async function processSuccessfulPayment(
  supabase: any,
  transaction: any,
  monetbilTransactionId: string
): Promise<{ success: boolean; adId?: string; error?: string }> {
  console.log('Payment successful, creating ad...');

  // Validate transaction amount against expected limits
  if (transaction.amount <= 0 || transaction.amount > 1000000) {
    return { 
      success: false, 
      error: `Invalid transaction amount: ${transaction.amount}` 
    };
  }

  // Create the ad from stored data
  const adData = transaction.payment_data.adData;
  const adType = transaction.payment_data.adType;

  // Validate ad data integrity
  if (!adData || !adData.title || !adData.description) {
    return { 
      success: false, 
      error: 'Invalid ad data in transaction' 
    };
  }

  const { data: ad, error: adError } = await supabase
    .from('ads')
    .insert({
      title: adData.title,
      description: adData.description,
      category: adData.category,
      price: adData.price,
      region: adData.region,
      city: adData.city,
      phone: adData.phone,
      whatsapp: adData.whatsapp || null,
      status: "pending",
      ad_type: adType,
      user_id: transaction.user_id,
      payment_transaction_id: transaction.id
    })
    .select('id')
    .single();

  if (adError) {
    console.error('Error creating ad:', adError);
    return { success: false, error: `Database error: ${adError.message}` };
  }

  console.log('Ad created successfully:', ad.id);
  
  // Handle images if present
  if (adData.images && adData.images.length > 0) {
    console.log('Note: Images will need to be handled separately');
  }

  return { success: true, adId: ad.id };
}
