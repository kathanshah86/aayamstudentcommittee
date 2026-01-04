-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for uploads bucket
CREATE POLICY "Anyone can view uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

CREATE POLICY "Admins can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'uploads' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads' AND has_role(auth.uid(), 'admin'));