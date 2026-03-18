ALTER TABLE public.chat_messages
	ADD COLUMN IF NOT EXISTS feedback text,
	ADD COLUMN IF NOT EXISTS feedback_note text;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'chat_messages_feedback_check'
	) THEN
		ALTER TABLE public.chat_messages
			ADD CONSTRAINT chat_messages_feedback_check
			CHECK (feedback IS NULL OR feedback IN ('like', 'dislike'));
	END IF;
END $$;