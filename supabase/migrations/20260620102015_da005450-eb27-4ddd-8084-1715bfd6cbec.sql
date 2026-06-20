
CREATE POLICY "Users can delete their own api_keys"
ON public.api_keys FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.conversations FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can write voice-audio" ON storage.objects;
CREATE POLICY "Service can write voice-audio"
ON storage.objects FOR INSERT TO service_role
WITH CHECK (bucket_id = 'voice-audio');
