
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-audio', 'voice-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read voice-audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-audio');

CREATE POLICY "Service can write voice-audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-audio');
