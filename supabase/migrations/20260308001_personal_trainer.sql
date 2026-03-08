-- Adiciona campo de personal trainer escolhido pelo usuário
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS personal_slug TEXT DEFAULT 'guilherme'
    CHECK (personal_slug IN ('guilherme', 'carlos', 'raul', 'maicon'));
