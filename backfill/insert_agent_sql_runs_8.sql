INSERT INTO public.agent_sql_runs (id,message_id,executed_sql,bq_result,created_at) VALUES
('7ce39d69-c7fd-482c-ab2d-31628f847b02','eb2d6d24-9778-45c7-a255-203a3bbb7dab','SELECT SUM(CAST(Amount AS FLOAT64)) AS revenue_collected FROM `tenms-userdb.english_centre.offline_transactions_gsheet_v3` WHERE Date BETWEEN DATE(''2026-02-01'') AND DATE(''2026-02-28'') LIMIT 1000;SELECT branch, SUM(CAST(Amount AS FLOAT64)) AS revenue_collected FROM `tenms-userdb.english_centre.offline_transactions_gsheet_v3` WHERE Date BETWEEN DATE(''2026-02-01'') AND DATE(''2026-02-28'') GROUP BY branch ORDER BY revenue_collected DESC LIMIT 1000
;
','[{"schema":{"fields":[{"name":"revenue_collected","type":"FLOAT","mode":"NULLABLE"}]},"rows":[{"f":[{"v":"7199800.0"}]}],"jobComplete":true}
], [{"schema":{"fields":[{"name":"branch","type":"STRING","mode":"NULLABLE"},{"name":"revenue_collected","type":"FLOAT","mode":"NULLABLE"}]},"rows":[{"f":[{"v":"Panthapath Branch"},{"v":"1647500.0"}]},{"f":[{"v":"Moghbazar Branch"},{"v":"1642350.0"}]},{"f":[{"v":"Uttara Branch"},{"v":"1553450.0"}]},{"f":[{"v":"Mirpur Branch"},{"v":"1273600.0"}]},{"f":[{"v":"Chawkbazar Branch"},{"v":"1082900.0"}]}],"jobComplete":true}
], [
]','2026-03-31 05:09:03.348395+00'),
('2edc0319-49dc-4936-8d5e-54f0311fbff7','48c2fed8-85ca-4da6-b16a-01b0b1cf594e','SELECT branch, COUNT(DISTINCT Mobile_Number) AS admissions FROM `tenms-userdb.english_centre.offline_admissions_gsheet_v3` WHERE admission_date = CURRENT_DATE() GROUP BY branch ORDER BY branch LIMIT 1000;
;
','[{"schema":{"fields":[{"name":"branch","type":"STRING","mode":"NULLABLE"},{"name":"admissions","type":"INTEGER","mode":"NULLABLE"}]},"jobComplete":true}
], [
], [
]','2026-03-31 05:11:02.212902+00'),
('968ef4b0-d175-44ec-a5a8-922733a93a7d','27e8d643-a522-40cb-baa8-0abb743b2837','SELECT branch, COUNT(DISTINCT Mobile_Number) AS admissions FROM `tenms-userdb.english_centre.offline_admissions_gsheet_v3` WHERE admission_date BETWEEN DATE ''2026-03-01'' AND DATE ''2026-03-31'' GROUP BY branch ORDER BY admissions DESC LIMIT 1000;
;
','[{"schema":{"fields":[{"name":"branch","type":"STRING","mode":"NULLABLE"},{"name":"admissions","type":"INTEGER","mode":"NULLABLE"}]},"rows":[{"f":[{"v":"Panthapath Branch"},{"v":"71"}]},{"f":[{"v":"Moghbazar Branch"},{"v":"51"}]},{"f":[{"v":"Uttara Branch"},{"v":"51"}]},{"f":[{"v":"Mirpur Branch"},{"v":"31"}]},{"f":[{"v":"Chawkbazar Branch"},{"v":"17"}]}],"jobComplete":true}
], [
], [
]','2026-03-31 05:11:52.041901+00'),
('cfbf74de-c2dd-4f44-9d72-20ad96634351','b31547be-36e5-4a47-bd1d-837ff27b5fd5','SELECT Email_Address AS ado_email, SUM(CAST(Amount AS FLOAT64)) AS revenue_collected_last_7_days FROM `tenms-userdb.english_centre.offline_transactions_gsheet_v3` WHERE Date BETWEEN CURRENT_DATE() - 6 AND CURRENT_DATE() AND Email_Address IS NOT NULL AND Email_Address != '''' GROUP BY ado_email ORDER BY revenue_collected_last_7_days DESC LIMIT 1000;
;
','[{"schema":{"fields":[{"name":"ado_email","type":"STRING","mode":"NULLABLE"},{"name":"revenue_collected_last_7_days","type":"FLOAT","mode":"NULLABLE"}]},"rows":[{"f":[{"v":"lamim@10minuteschool.com"},{"v":"157000.0"}]},{"f":[{"v":"mim@10minuteschool.com"},{"v":"119640.0"}]},{"f":[{"v":"rodela@10minuteschool.com"},{"v":"110000.0"}]},{"f":[{"v":"sornali@10minuteschool.com"},{"v":"99500.0"}]},{"f":[{"v":"al.amin@10minuteschool.com"},{"v":"93000.0"}]},{"f":[{"v":"meem@10minuteschool.com"},{"v":"78600.0"}]},{"f":[{"v":"alpana@10minuteschool.com"},{"v":"69000.0"}]},{"f":[{"v":"fahim@10minuteschool.com"},{"v":"55600.0"}]},{"f":[{"v":"jogodish@10minuteschool.com"},{"v":"55000.0"}]},{"f":[{"v":"eva@10minuteschool.com"},{"v":"49000.0"}]},{"f":[{"v":"hayatun@10minuteschool.com"},{"v":"40500.0"}]},{"f":[{"v":"protyasha@10minuteschool.com"},{"v":"24000.0"}]},{"f":[{"v":"shatabdi@10minuteschool.com"},{"v":"22500.0"}]},{"f":[{"v":"farjana.eva@10minuteschool.com"},{"v":"21500.0"}]},{"f":[{"v":"puspo@10minuteschool.com"},{"v":"19000.0"}]},{"f":[{"v":"touhidul.maruf@10minuteschool.com"},{"v":"9000.0"}]},{"f":[{"v":"raheta@10minuteschool.com"},{"v":"7000.0"}]}],"jobComplete":true}
], [
], [
]','2026-03-31 05:13:13.215466+00'),
('4dea006e-f1ff-416d-af76-5aac19e69c62','56c24bd8-8102-4510-b0e3-faf7a049a83a','SELECT SUM(CAST(Amount AS FLOAT64)) AS revenue_collected FROM `tenms-userdb.english_centre.offline_transactions_gsheet_v3` WHERE Date BETWEEN DATE_TRUNC(CURRENT_DATE(), MONTH) AND CURRENT_DATE() LIMIT 1000;
;
','[{"schema":{"fields":[{"name":"revenue_collected","type":"FLOAT","mode":"NULLABLE"}]},"rows":[{"f":[{"v":"3751510.0"}]}],"jobComplete":true}
], [
], [
]','2026-03-31 05:31:55.686244+00')
ON CONFLICT (id) DO NOTHING;