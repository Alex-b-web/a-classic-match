-- A Classic Match: run the streak reminder emails every hour.
-- Before running: deploy the "streak-reminders" function and set its CRON_SECRET secret.
-- Then replace the two placeholders below and run this in Supabase → SQL Editor.
--   YOUR-PROJECT-REF  → Project Settings → General → Project ID
--   YOUR-CRON-SECRET  → the same value you saved as the CRON_SECRET secret

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove an older copy of the schedule if you are running this again.
select cron.unschedule(jobid) from cron.job where jobname = 'acm-streak-reminders';

select cron.schedule(
  'acm-streak-reminders',
  '0 * * * *',  -- at the start of every hour
  $$
  select net.http_post(
    url     := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/streak-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'YOUR-CRON-SECRET'),
    body    := '{}'::jsonb
  );
  $$
);

-- To check it ran:  select * from cron.job_run_details order by start_time desc limit 5;
