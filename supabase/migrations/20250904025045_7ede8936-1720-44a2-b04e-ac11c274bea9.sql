-- Create storage buckets for ad images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for ad images
CREATE POLICY "Anyone can view ad images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ad-images');

CREATE POLICY "Authenticated users can upload ad images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own ad images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ad-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own ad images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ad-images' AND auth.role() = 'authenticated');