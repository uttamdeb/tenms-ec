ALTER TABLE public.chat_sessions
  ADD COLUMN mode TEXT NOT NULL DEFAULT 'ec';

ALTER TABLE public.chat_messages
  ADD COLUMN mode TEXT NOT NULL DEFAULT 'ec';

ALTER TABLE public.suggested_messages
  ADD COLUMN mode TEXT NOT NULL DEFAULT 'ec';

-- Ensure existing suggested messages are associated with the EC mode by default.
UPDATE public.suggested_messages
SET mode = 'ec'
WHERE mode IS NULL;

-- Add 10MS-specific suggested messages.
INSERT INTO public.suggested_messages (message, mode) VALUES
('Show online segment registrations for the 10MS mobile app'),
('Compare OB vs HSC revenue this month'),
('What is the conversion rate for TenTen product signups?'),
('Show traffic and registration sources for SSC campaigns'),
('Show paid vs organic lead performance for online courses'),
('Show week-over-week active learner trends for OB'),
('Which online product had the best retention this month?'),
('Show revenue by product category for the last 30 days'),
('Show top-performing ads driving 10MS registrations'),
('Compare current funnel performance between OB and SSC'),
('Show engagement rates for TenTen learners this week'),
('Show daily active users for online segments'),
('Which campaign had the highest ROAS last month?'),
('Show refund and churn signal for 10MS products'),
('Summarize online course performance for the past week');
