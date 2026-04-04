INSERT INTO public.agent_sql_runs (id,message_id,executed_sql,bq_result,created_at) VALUES
('29b51fd9-d09c-4660-b576-4d91cd4b1db3','e13d78fb-6966-4ab9-899e-940e439bea43','SELECT admission_date, COUNT(DISTINCT Mobile_Number) AS admissions FROM `tenms-userdb.english_centre.offline_admissions_gsheet_v3` WHERE Email_Address = ''lamim@10minuteschool.com'' AND admission_date BETWEEN DATE_TRUNC(CURRENT_DATE(), MONTH) AND CURRENT_DATE() GROUP BY admission_date ORDER BY admission_date DESC LIMIT 1000;
;
','[{"schema":{"fields":[{"name":"admission_date","type":"DATE","mode":"NULLABLE"},{"name":"admissions","type":"INTEGER","mode":"NULLABLE"}]},"jobComplete":true}
], [
], [
]','2026-04-02 08:00:23.72898+00'),
('b7c609d2-e828-450e-99be-c59216fd061b','bf02fc23-4e57-4ed1-81f6-baf4ba558124','SELECT data_source, COUNT(DISTINCT contact) AS registrations, COUNT(DISTINCT CASE WHEN attendance_status IN (''present'',''present_early'',''present_late'') THEN contact END) AS attendance, ROUND(SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN attendance_status IN (''present'',''present_early'',''present_late'') THEN contact END), COUNT(DISTINCT contact)) * 100, 2) AS rta_pct FROM `tenms-userdb.Marketing_Leads.offline_leads_api` GROUP BY data_source ORDER BY rta_pct ASC, registrations DESC LIMIT 1000;
;
','[{"schema":{"fields":[{"name":"data_source","type":"STRING","mode":"NULLABLE"},{"name":"registrations","type":"INTEGER","mode":"NULLABLE"},{"name":"attendance","type":"INTEGER","mode":"NULLABLE"},{"name":"rta_pct","type":"FLOAT","mode":"NULLABLE"}]},"rows":[{"f":[{"v":"Tally Form"},{"v":"372"},{"v":"20"},{"v":"5.38"}]},{"f":[{"v":"Facebook Form"},{"v":"158068"},{"v":"9728"},{"v":"6.15"}]},{"f":[{"v":"Booking System"},{"v":"42021"},{"v":"2677"},{"v":"6.37"}]},{"f":[{"v":"Google Form"},{"v":"64667"},{"v":"4460"},{"v":"6.9"}]},{"f":[{"v":"iHelp"},{"v":"781"},{"v":"85"},{"v":"10.88"}]},{"f":[{"v":"Micro Survey"},{"v":"2640"},{"v":"437"},{"v":"16.55"}]},{"f":[{"v":"ClassroomOS"},{"v":"7407"},{"v":"2813"},{"v":"37.98"}]}],"jobComplete":true}
], [
], [
]','2026-04-02 10:58:53.008013+00'),
('23efdc4b-71f5-4c17-83b8-a0aaa7fac89d','a70ab60d-2a23-4a9b-bc22-4fcd93a2ab43','SELECT Email_Address, COUNT(DISTINCT Mobile_Number) AS admissions FROM `tenms-userdb.english_centre.offline_admissions_gsheet_v3` GROUP BY Email_Address ORDER BY admissions DESC LIMIT 5;
;
','[{"schema":{"fields":[{"name":"Email_Address","type":"STRING","mode":"NULLABLE"},{"name":"admissions","type":"INTEGER","mode":"NULLABLE"}]},"rows":[{"f":[{"v":"meem@10minuteschool.com"},{"v":"1296"}]},{"f":[{"v":"mim@10minuteschool.com"},{"v":"1077"}]},{"f":[{"v":"eva@10minuteschool.com"},{"v":"998"}]},{"f":[{"v":"jogodish@10minuteschool.com"},{"v":"971"}]},{"f":[{"v":"al.amin@10minuteschool.com"},{"v":"964"}]}],"jobComplete":true,"queryId":"job_X7CsFLtCsLI5N2W6IdCvxzTiSrLj","totalBytesBilled":"10485760","totalSlotMs":"27","totalBytesProcessed":"782917"}
], [
], [
]','2026-04-04 06:39:46.363301+00')
ON CONFLICT (id) DO NOTHING;