-- Notificações push agendadas (ex: lembrete pós-treino 1h depois)
CREATE TABLE public.scheduled_push_notifications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  title         TEXT        NOT NULL,
  body          TEXT        NOT NULL,
  url           TEXT        DEFAULT '/dashboard',
  icon          TEXT        DEFAULT '/icon-192.png',
  sent          BOOLEAN     NOT NULL DEFAULT false,
  sent_at       TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para a Edge Function buscar notificações pendentes
CREATE INDEX idx_scheduled_push_pending
  ON public.scheduled_push_notifications(scheduled_for)
  WHERE sent = false;

-- RLS
ALTER TABLE public.scheduled_push_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON public.scheduled_push_notifications
  USING (true) WITH CHECK (true);
