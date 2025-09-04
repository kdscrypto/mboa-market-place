-- Create ad_ratings table for the rating system
CREATE TABLE public.ad_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ad_id, user_id)
);

-- Enable RLS
ALTER TABLE public.ad_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_ratings
CREATE POLICY "Public can view ratings for approved ads" 
ON public.ad_ratings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.ads 
  WHERE ads.id = ad_ratings.ad_id 
  AND ads.status = 'approved'
));

CREATE POLICY "Users can create ratings for approved ads" 
ON public.ad_ratings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.ads 
    WHERE ads.id = ad_ratings.ad_id 
    AND ads.status = 'approved'
    AND ads.user_id != auth.uid()  -- Can't rate own ads
  )
);

CREATE POLICY "Users can update their own ratings" 
ON public.ad_ratings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.ad_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_ad_ratings_updated_at
BEFORE UPDATE ON public.ad_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();