-- Adiciona campo avatar_url ao perfil do usuário
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Bucket público para avatares (fotos de perfil)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: usuário só faz upload no próprio diretório
CREATE POLICY "avatars: upload proprio" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: usuário pode atualizar/deletar próprio avatar
CREATE POLICY "avatars: update proprio" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: leitura pública (para exibir avatar)
CREATE POLICY "avatars: leitura publica" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
