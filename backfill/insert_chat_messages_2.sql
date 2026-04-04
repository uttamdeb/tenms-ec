INSERT INTO public.chat_messages (id,session_id,user_id,role,content,feedback,feedback_note,created_at) VALUES
('74e0d121-b344-46a7-8e8a-6c720e0e9be9','cf42e44b-ce18-4ca8-aae1-83ef51362d1b','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam! How may I help with English Centre (EC) data today?',NULL,NULL,'2026-03-08 06:01:39.715639+00'),
('7136e64f-cde2-48aa-95d5-21850d5b3eb7','47ec2063-4d3d-4fbd-8012-3697acf32a9a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hello',NULL,NULL,'2026-03-08 06:06:04.514608+00'),
('9c0d145b-0a62-49ed-8b3d-3b2fe17805dd','47ec2063-4d3d-4fbd-8012-3697acf32a9a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb. How may I help you with English Centre (EC) data today—Registrations, Attendance, Admissions, RTA/ATA, Walk-ins, or Revenue?',NULL,NULL,'2026-03-08 06:06:08.95643+00'),
('70f50b51-d331-41f2-8fe7-ca2b15c7fac0','47ec2063-4d3d-4fbd-8012-3697acf32a9a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','who am i?',NULL,NULL,'2026-03-08 06:06:15.179046+00'),
('c1fcd14d-145f-495c-8eae-8b2d1b4f6d48','47ec2063-4d3d-4fbd-8012-3697acf32a9a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb. From the English Centre context, you are Uttam Deb — the Business Intelligence (BI) Analyst for 10 Minute School and the primary data stakeholder for English Centres (EC). You also developed this AI system (EC Data Agent).',NULL,NULL,'2026-03-08 06:06:18.986918+00'),
('f32a0095-3771-47ac-b5e0-5d0c15107248','47ec2063-4d3d-4fbd-8012-3697acf32a9a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','who is Riya?',NULL,NULL,'2026-03-08 06:06:26.055432+00'),
('ea7a04ce-fe1c-4f36-b2c6-04ea64bf4571','47ec2063-4d3d-4fbd-8012-3697acf32a9a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb. Nishat Afsara Riya is a stakeholder who is not involved in day-to-day branch operations, but she uses the G99 English Centre dashboard’s “Reporting” tab and updates monthly targets and daily key-metric reports for the English Centres team.',NULL,NULL,'2026-03-08 06:06:29.232739+00'),
('34a8ad41-5a55-4b6c-9be6-62cfde484bde','fbba715e-ff5f-45d3-9fd8-c6371dd491b5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','how many leads are called yesterday?',NULL,NULL,'2026-03-08 07:37:24.446798+00'),
('0d6b040d-40c2-484b-8be1-3cd2877e3a98','fbba715e-ff5f-45d3-9fd8-c6371dd491b5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam, **42 leads were called yesterday** (unique contact count).',NULL,NULL,'2026-03-08 07:37:36.003382+00'),
('8fa075d0-0c00-444b-9de5-32f02fd9a807','fbba715e-ff5f-45d3-9fd8-c6371dd491b5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','and how many were tele-eligible?',NULL,NULL,'2026-03-08 07:38:13.474571+00'),
('5201b8f3-ffcf-43dd-939a-c72b0222f570','fbba715e-ff5f-45d3-9fd8-c6371dd491b5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb—tele-eligible is counted from `raw_product_content.offline_free_class_cx` as the number of distinct contacts where the record is within your selected submission_date window and the contact is present in the CX sheet (valid number, not in DND/employee list, last 30 days logic applied). 

Please tell me the date range you want (e.g., last 30 days, this month, or a specific start–end date) and whether you want overall or branch-wise/programme-wise. Then I’ll run the BigQuery and share the tele-eligible count.',NULL,NULL,'2026-03-08 07:38:21.787153+00'),
('87308f60-f6b9-4797-9b74-3785444b1446','faba4c8b-257b-4701-b40e-e0206e99d2a2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','what was the revenue in the last 30 days?',NULL,NULL,'2026-03-08 08:16:45.119534+00'),
('4ffc1673-c3a1-464d-ad51-ca282dd4dc94','faba4c8b-257b-4701-b40e-e0206e99d2a2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam, in the last **30 days** the **Revenue (Collection)** was **৳7,471,050**.',NULL,NULL,'2026-03-08 08:16:54.5286+00'),
('24cff695-2156-427e-b1c6-6ab3735d87c0','faba4c8b-257b-4701-b40e-e0206e99d2a2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','by branch?',NULL,NULL,'2026-03-08 08:17:33.532227+00'),
('d5b321d5-6a51-472f-938d-f5037177b3da','faba4c8b-257b-4701-b40e-e0206e99d2a2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb—by branch for which metric and which time range?

Options (pick one):
1) Registrations (unique contacts) from offline_leads_api
2) Attendance (unique contacts) from offline_leads_api (attendance_status in present/present_early/present_late)
3) Admissions (unique contacts) from offline_leads_api (admission_date not null) or from offline_admissions_gsheet_v3
4) Walk-ins (unique mobile_number) from visitor_ledger_view (visit_type=''Walk-in'')

Also confirm date range: Today / last 7 days / MTD / last 30 days / custom dates.',NULL,NULL,'2026-03-08 08:17:39.224792+00'),
('3ab8cace-532c-4b32-915c-9f8e1ab93239','faba4c8b-257b-4701-b40e-e0206e99d2a2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','what was the revenue in the last 30 days? by branch',NULL,NULL,'2026-03-08 08:18:03.900315+00'),
('72954ac5-f2cc-43bf-b352-1fc1530a3fa4','faba4c8b-257b-4701-b40e-e0206e99d2a2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam — **Revenue (Collection) in the last 30 days (by branch):**

- **Moghbazar Branch:** ৳1,730,950  
- **Panthapath Branch:** ৳1,702,750  
- **Uttara Branch:** ৳1,627,150  
- **Mirpur Branch:** ৳1,248,100  
- **Chawkbazar Branch:** ৳1,162,100  

**Total:** ৳7,471,050',NULL,NULL,'2026-03-08 08:18:15.016507+00'),
('74588f6a-d9d6-4bfd-a959-c0164e4c09ec','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Uttam, আজকের মোট **Revenue (Collection)** = **৳109,400**।',NULL,NULL,'2026-03-08 14:04:39.459654+00'),
('5d5a9c11-1022-4fec-93c2-513e8fa5121c','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','day on day revenue bartese naki komtese ei month e?',NULL,NULL,'2026-03-08 14:04:52.828853+00'),
('83b0fe45-a5a8-488f-8443-ba9bd8805af4','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb,

Ei month (March 2026) **day-on-day revenue (collection)** mixed—**overall consistently barche na**, up-down hocche.

**Date-wise Collection (BDT) + DoD change**
- **Mar 01:** 150,600  
- **Mar 02:** 78,700 (**↓ 47.7%**)  
- **Mar 03:** 50,500 (**↓ 35.8%**)  
- **Mar 04:** 51,000 (**↑ 1.0%**)  
- **Mar 05:** 73,200 (**↑ 43.5%**)  
- **Mar 06:** 448,550 (**↑ 512.5%**)  
- **Mar 07:** 338,000 (**↓ 24.6%**)  
- **Mar 08:** 109,400 (**↓ 67.6%**)

**Summary (MTD: Mar 1–8)**
- **Up days:** 3 (Mar 4, 5, 6)  
- **Down days:** 4 (Mar 2, 3, 7, 8)  
- Biggest jump: **Mar 6** (due to a large spike)
- Biggest drop: **Mar 8**

Chao hole ami **branch-wise / program-wise split** diyeo ber kore dite pari—kon branch spike ta drive korse (especially Mar 6).',NULL,NULL,'2026-03-08 14:05:09.731542+00'),
('b08ab5af-432d-4ea6-a443-ec6b67d49265','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','kon branch egiye ache?',NULL,NULL,'2026-03-08 14:05:39.154659+00'),
('519de42d-9d33-42e5-8714-224e860967fb','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Uttam, আজকে **Mirpur Branch** এগিয়ে আছে — **৳48,900** collection.

আজকের branch-wise Revenue (Collection):
- **Mirpur Branch:** ৳48,900  
- **Panthapath Branch:** ৳24,000  
- **Moghbazar Branch:** ৳19,500  
- **Chawkbazar Branch:** ৳17,000  

(এই query result-এ **Uttara Branch** আজকে transaction নেই/ডাটা আসেনি।)',NULL,NULL,'2026-03-08 14:05:51.556247+00'),
('ad2951cb-f57c-484a-8bfe-15c88f4189b8','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','ei year so far highest revenue earning day konta chilo by branch?',NULL,NULL,'2026-03-08 14:07:02.466404+00'),
('2d79f789-364a-4e13-9633-fd9bd42ad0b7','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb,

**2026 year-to-date (Jan 1 – today) highest revenue (collection) day by branch:**

| Branch | Highest revenue day | Collected revenue (BDT) |
|---|---:|---:|
| **Uttara Branch** | 2026-01-31 | **511,500** |
| **Panthapath Branch** | 2026-01-31 | **368,400** |
| **Mirpur Branch** | 2026-01-30 | **463,100** |
| **Moghbazar Branch** | 2026-01-30 | **553,400** |
| **Chawkbazar Branch** | 2026-01-31 | **589,500** |

If you want, I can also pull **what drove those peaks** (top programs / top ADO tokens / number of transactions on that day) for each branch.',NULL,NULL,'2026-03-08 14:07:13.982229+00'),
('6f31b8b0-2737-41f2-80d5-b5ad121456f1','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','ajke koto jon ke call kora hoyeche? je sql ta run korteso etao ektu dio',NULL,NULL,'2026-03-08 14:13:47.778447+00'),
('6d13a5b4-607b-43fa-a7d5-7ad2c9a801aa','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb,

**Ajke total call kora hoyeche:** **554 jon** (distinct contact).

**SQL (jeta run korsi):**
```sql
SELECT
  COUNT(DISTINCT contact) AS called_today
FROM `tenms-userdb.raw_product_content.offline_free_class_cx`
WHERE submission_date BETWEEN CURRENT_DATE() - 30 AND CURRENT_DATE()
  AND DATE(SAFE_CAST(calling_date AS DATETIME)) = CURRENT_DATE();
```',NULL,NULL,'2026-03-08 14:13:58.205719+00'),
('f3ef687b-8f92-474e-b9d5-318098ff1a39','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','ajke raheta kotojon ke admit koriyeche?',NULL,NULL,'2026-03-08 14:16:03.529705+00'),
('927ea729-de01-45ed-a168-9b64c876ed37','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam, ajke Raheta (raheta@10minuteschool.com) **0 jon** ke admit koriyeche (today admissions = 0).',NULL,NULL,'2026-03-08 14:16:11.047815+00'),
('3b9fec33-ba96-4661-bdf0-f9c1ab76e28a','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','ajke walkin koto gula hoise, by branch',NULL,NULL,'2026-03-08 14:20:13.481931+00'),
('e30ba883-76fb-4ee8-9c6e-c5d534f584ca','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam, **ajke walk-in (by branch):**

- **Chawkbazar Branch:** 7  
- **Moghbazar Branch:** 1  
- **Panthapath Branch:** 1  
- **Uttara Branch:** 1  

**Total:** 10 walk-ins.',NULL,NULL,'2026-03-08 14:20:25.67003+00'),
('5820f45a-d626-4117-9835-98433c888466','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','who are the ADOs?',NULL,NULL,'2026-03-08 14:49:20.075252+00'),
('ea0e1741-ef12-4370-ac70-b846d7a46556','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam. Here are the Admission Officers (ADOs) for English Centres:

Uttara Branch:
- Hasna Hana Eva (eva@10minuteschool.com)
- Alpana Akter (alpana@10minuteschool.com)
- Aysha Siddiqua Mim (mim@10minuteschool.com)
- Rabbi (rabbi@10minuteschool.com)
- Touhidul Islam Maruf (touhidul.maruf@10minuteschool.com)

Panthapath Branch:
- Maliha Monowara Meem (meem@10minuteschool.com)
- Al Amin (al.amin@10minuteschool.com)
- Sornali Ahmed (sornali@10minuteschool.com)
- Ashrafur (ashrafur@10minuteschool.com)

Mirpur Branch:
- Jogodish Ghosh (jogodish@10minuteschool.com)
- Humayra Kabir Shatabdi (shatabdi@10minuteschool.com)
- Marajul Haque Fahim (fahim@10minuteschool.com)
- Farjana Hasan Mim (farjana@10minuteschool.com)
- Jesmin (jesmin@10minuteschool.com)
- Ali (ali@10minuteschool.com)
- Prerona (prerona@10minuteschool.com)

Moghbazar Branch:
- Nomit Akone Lamim (lamim@10minuteschool.com)
- Hayatun Nesa Mim (hayatun@10minuteschool.com)
- Naznin Khan Protyasha (protyasha@10minuteschool.com)
- RODELA SARKAR (rodela@10minuteschool.com)
- Sakib (sakib@10minuteschool.com)

Chawkbazar Branch:
- Nilufar Sultana Puspo (puspo@10minuteschool.com)
- Farjana Karim Eva (farjana.eva@10minuteschool.com)
- Raheta Sadeka (raheta@10minuteschool.com)
- Pranto (pranto@10minuteschool.com)
- Dilshad (dilshad@10minuteschool.com)',NULL,NULL,'2026-03-08 14:49:32.630804+00'),
('cb60b4d8-ce24-467a-8868-a2529a0d3edd','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','ajker din e asha branch wise regsitration er ekta pie chart banay dao',NULL,NULL,'2026-03-08 15:04:36.021989+00'),
('a7891c75-6c54-4443-8807-9cbd9515146f','141cf861-cbed-42da-853f-3d41d6f5818f','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb,

**Ajker branch-wise registrations (pie chart split)** — total **120** regs.

| Branch | Registrations | Share |
|---|---:|---:|
| Mirpur Branch | 36 | 30.0% |
| Chawkbazar Branch | 31 | 25.8% |
| Uttara Branch | 27 | 22.5% |
| Panthapath Branch | 14 | 11.7% |
| Moghbazar Branch | 12 | 10.0% |

**Pie chart data (copy-paste to Sheets/Looker Studio):**
```
Branch,Registrations
Mirpur Branch,36
Chawkbazar Branch,31
Uttara Branch,27
Panthapath Branch,14
Moghbazar Branch,12
```

**SQL used:**
```sql
SELECT
  branch,
  COUNT(DISTINCT contact) AS registrations_today
FROM `tenms-userdb.Marketing_Leads.offline_leads_api`
WHERE submission_date = CURRENT_DATE()
GROUP BY branch
ORDER BY registrations_today DESC;
```',NULL,NULL,'2026-03-08 15:04:48.048279+00'),
('57ab2024-faaf-4da5-86b2-8aff37b14dfe','2df2f50e-e883-4c6c-b990-c47aad17a1bb','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Sanjida asked me for a data: per day and week a amader kmn lead ashe for free class and walkin. real data count and percentage.',NULL,NULL,'2026-03-09 06:34:25.422999+00'),
('99f0ecdb-6ee1-4f9d-95c8-b11f5533deb3','f45a6faf-3b05-4578-bbcd-6e4adf77ad82','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam, Facebook leads are **not attending well** overall.

- **Registrations:** 154,538
- **Attendance:** 9,615
- **RTA:** **6.22%**

So out of every 100 Facebook Form leads, only about **6** attended a free class.

If you want, I can also break this down by:
- **branch**
- **programme**
- **month**
- **lead source**
- or compare **Facebook vs Booking System vs ClassroomOS** to see whether Facebook is underperforming relative to other sources.',NULL,NULL,'2026-03-17 19:56:53.417386+00'),
('cf4bf19c-98be-4d4c-8479-afa0d027c461','df5af3b4-beb8-48a9-9b2a-9cbcd1cb5732','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, here is Mirpur Branch performance for today.

| Metric | Value |
|---|---:|
| Registrations | 13 |
| Attendance | 0 |
| Admissions | 0 |
| RTA | 0.00% |
| ATA | N/A |
| Walk-ins | 0 |
| Walk-in Admissions | 0 |
| Revenue Collection | BDT 0 |

**Quick read:**
- Mirpur got **13 registrations** today.
- So far there is **no attendance recorded** today.
- As a result, **no admissions** or **revenue collection** have been recorded yet.
- **ATA is N/A** because attendance is 0, so admission-to-attendance conversion cannot be calculated.

If you want, I can also show:
1. **branch-wise performance today**
2. **Mirpur today vs yesterday**
3. **Mirpur hourly trend for today**',NULL,NULL,'2026-03-21 19:33:46.57912+00'),
('8ee3d95a-86dc-4c6c-bc9a-e7dfb5977346','2df2f50e-e883-4c6c-b990-c47aad17a1bb','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam — Sanjida’r jonno **Free Class lead (registration) per day & per week** er **real count + branch share (%)** ready.

## 1) Daily (latest day)
**Date: 2026-03-09 | Total Free Class Leads: 49**

| Branch | Leads | % of day |
|---|---:|---:|
| Uttara Branch | 15 | 30.6% |
| Chawkbazar Branch | 14 | 28.6% |
| Mirpur Branch | 10 | 20.4% |
| Panthapath Branch | 6 | 12.2% |
| Moghbazar Branch | 4 | 8.2% |

## 2) Weekly (latest week-to-date)
**Week start (Mon): 2026-03-09 | Total Free Class Leads: 49** *(so far)*

| Branch | Leads | % of week |
|---|---:|---:|
| Uttara Branch | 15 | 30.6% |
| Chawkbazar Branch | 14 | 28.6% |
| Mirpur Branch | 10 | 20.4% |
| Panthapath Branch | 6 | 12.2% |
| Moghbazar Branch | 4 | 8.2% |

## 3) Previous full week snapshot (for context)
**Week start: 2026-03-02 | Total Free Class Leads: 2,604**

| Branch | Leads | % of week |
|---|---:|---:|
| Uttara Branch | 751 | 28.8% |
| Chawkbazar Branch | 597 | 22.9% |
| Mirpur Branch | 565 | 21.7% |
| Panthapath Branch | 301 | 11.6% |
| Moghbazar Branch | 289 | 11.1% |
| (Blank/Unmapped branch) | 274 | 10.5% |

### Important note (Walk-in)
Your SQL/result set **only contains Free Class leads** (`offline_leads_api`). **Walk-in count/percentage is not included** (walk-in columns are NULL everywhere).

If you tell me the walk-in source table (usually from ClassroomOS walk-in/visitor log), I’ll generate the same **daily + weekly walk-in counts + branch share (%)**, and also a combined view: **Free class vs Walk-in**.',NULL,NULL,'2026-03-09 06:34:51.089758+00'),
('e61bdf4c-af81-41a9-968f-a0ad916f2ff3','2df2f50e-e883-4c6c-b990-c47aad17a1bb','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Walk in attendance er table e',NULL,NULL,'2026-03-09 06:35:55.444923+00'),
('eac50f5a-9258-40dc-a191-18afa4fc3dba','2df2f50e-e883-4c6c-b990-c47aad17a1bb','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam — yes, **walk-in attendance/source** is coming from this table/view:

**`tenms-userdb.ab_ihelp_report_db.visitor_ledger_view`**  
Filter used: `visit_type = ''Walk-in''`  
Date field: `visiting_date`  
Phone field: `mobile_number`

### Quick sanity check (latest days from your result)
- **2026-03-09:** Walk-in total = **0**
- **2026-03-08:** Walk-in total = **6** (Chawkbazar 4, Moghbazar 1, Panthapath 1)
- **2026-03-07:** Walk-in total = **10** (Panthapath 6, Uttara 4)

If you want, I can format a clean **Daily + Weekly** report for Sanjida with:
- Free class leads (count + % share)
- Walk-in visitors (count + % share)
- Combined (free class + walk-in) (count + % share)',NULL,NULL,'2026-03-09 06:36:38.973233+00'),
('19d0ec9a-b3ae-40e2-ab64-edce2216d396','2df2f50e-e883-4c6c-b990-c47aad17a1bb','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Yes, clean report please',NULL,NULL,'2026-03-09 06:37:09.809081+00'),
('1f6b6e27-b871-4fbf-8f06-67f3f894e8c5','2df2f50e-e883-4c6c-b990-c47aad17a1bb','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam—what should this “clean report” include?

Please confirm these 4 items so I can prepare it in the exact format you need:
1) Date range: today / yesterday / last 7 days / this month / custom (start–end)
2) Level: overall / branch-wise / programme-wise / both
3) Metrics: registrations, attendance, admissions, RTA, ATA, walk-ins, revenue (booking/collection/due) — which ones?
4) Output format: Looker Studio-style table, Google Sheet-ready CSV, or a short summary.

If you want, reply with: “Last 7 days, branch-wise, regs+att+admissions+RTA+ATA, sheet-ready.”',NULL,NULL,'2026-03-09 06:37:17.519993+00'),
('31cbaf8e-e207-4e55-8775-a273af8aaae7','032219d3-e6b5-4e52-9094-081424bae05c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','is this data right? Programme Registration Target (Month till date)


| Programme                                   | Target | Registrations | Achieved (%) |
|---------------------------------------------|--------|---------------|--------------|
| IELTS Programme                             | 2,281  | 2,400         | 105%         |
| Spoken English Junior (Class 6–10)         | 1,570  | 3,719         | 237%         |
| Spoken English Course                       | 645    | 3,536         | 548%         |
| Kids English (Class 3–Class 5)              | 387    | 198           | 51%          |
| Kids English (KG–Class 2)                   | 387    | 999           | 258%         |',NULL,NULL,'2026-03-11 07:53:15.541397+00'),
('9d30b001-63e3-4e11-80ce-917da3a89df2','032219d3-e6b5-4e52-9094-081424bae05c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam — I can verify this from BigQuery, but I need 2 clarifications because “Month till date” depends on how the month and target were set.

1) Which month is this for (e.g., Mar 2026), and should MTD mean from the 1st of that month up to today (CURRENT_DATE in Dhaka)?
2) For “Registrations”, should I count DISTINCT contact by programme from `Marketing_Leads.offline_leads_api` (submission_date based), and include both new + old statuses?

If you confirm these 2 points, I’ll return the exact programme-wise registration counts + achieved% to match your table.',NULL,NULL,'2026-03-11 07:53:23.547278+00'),
('5c6e08fa-05fd-4ff0-b813-b4d929eea6c8','032219d3-e6b5-4e52-9094-081424bae05c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','just give me Mar 1 to Mar 10 programme wise registration count',NULL,NULL,'2026-03-11 07:55:01.777703+00'),
('c18621c4-2449-4afe-9a90-b172d3833ec2','87955fed-1bdb-4fef-a504-97b61b2a5418','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hey',NULL,NULL,'2026-03-11 08:09:10.359112+00'),
('da45bc10-8a9d-42bd-9d26-54ecc5f0d3db','87955fed-1bdb-4fef-a504-97b61b2a5418','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam. How may I help?',NULL,NULL,'2026-03-11 08:09:15.53258+00'),
('56dbc46c-f8cc-4138-b578-8ca835aad4aa','87955fed-1bdb-4fef-a504-97b61b2a5418','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','how many regs today all branch',NULL,NULL,'2026-03-11 08:11:26.968657+00'),
('7eb53edc-6e04-49e3-9cc3-32e72b6ebc8c','87955fed-1bdb-4fef-a504-97b61b2a5418','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam, today’s registrations by branch:

- Uttara: 14
- Mirpur: 14
- Chawkbazar: 13
- Panthapath: 5
- Moghbazar: 3

Total: 49 registrations today.',NULL,NULL,'2026-03-11 08:11:41.272562+00'),
('4fba1ab7-b1b5-43a6-9d19-431c9922ef1e','02a41afe-08b7-42d7-9ce0-2e7fe923a6b8','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hi',NULL,NULL,'2026-03-11 08:15:33.098665+00'),
('ab721898-2643-4d75-9ceb-e51e32d27669','02a41afe-08b7-42d7-9ce0-2e7fe923a6b8','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam. How may I help?',NULL,NULL,'2026-03-11 08:15:38.340629+00'),
('984135d8-8526-4382-8b46-c648504cdfa8','02a41afe-08b7-42d7-9ce0-2e7fe923a6b8','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','how many regs today across all branch',NULL,NULL,'2026-03-11 08:16:07.289899+00'),
('f58b677c-fcaa-49d0-8712-708197c03a07','02a41afe-08b7-42d7-9ce0-2e7fe923a6b8','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam, today’s total registrations across all branches: 49.',NULL,NULL,'2026-03-11 08:16:15.563943+00'),
('beb90c17-549d-4f12-a5fa-ce20a6e2e7c9','8c1fe1f4-8044-46a3-a038-12134a0ea03a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','How many regs for Spoken English course from mar 1 to mar 11?',NULL,NULL,'2026-03-12 03:57:55.626582+00'),
('18f9ae83-d62a-47c0-8139-ed0a0fdc08aa','8c1fe1f4-8044-46a3-a038-12134a0ea03a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam, Spoken English course registrations from Mar 1 to Mar 11 were **1,361**.',NULL,NULL,'2026-03-12 03:58:08.149758+00'),
('cbfc28cb-58d3-45ad-81be-d6d036ddd156','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','registration data branch wise feb 1-28',NULL,NULL,'2026-03-12 05:26:55.122014+00'),
('ac62d623-3652-4c54-b17d-c09a8eb00d04','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Branch-wise registration data for 1 Feb to 28 Feb:

- Uttara Branch: 3,379
- Mirpur Branch: 2,380
- Chawkbazar Branch: 2,148
- Panthapath Branch: 1,286
- Moghbazar Branch: 965
- Unassigned/Blank Branch: 1,473

Total: 11,631

If you want, I can also give this in:
- branch-wise % contribution
- day-wise trend
- programme-wise split within each branch',NULL,NULL,'2026-03-12 05:27:05.648838+00'),
('9a0d6bbc-dfc2-48da-8d9d-cc3a567cf1eb','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','registration data branch wise program wise feb 1-28, provide in a table',NULL,NULL,'2026-03-12 05:27:52.528327+00'),
('998fbfea-9242-4a61-99ac-06f4ea67c3bf','0589bce6-8377-4b6f-adc2-d9bed7bb6134','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, BI.

How can I help with EC data today?

You can ask for things like:
- registrations, attendance, admissions
- RTA or ATA
- branch-wise or programme-wise performance
- ADO-wise admissions or revenue
- walk-ins and walk-in admissions
- source-wise lead performance
- collection, booking, due, or installment trends',NULL,NULL,'2026-03-21 19:36:04.893004+00'),
('dcefbcb0-71ce-4851-8962-37225760df34','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Here is the branch-wise, programme-wise registration table for 1 Feb to 28 Feb:

| Branch | Programme | Registrations |
|---|---|---:|
| Unassigned/Blank | Blank Programme | 315 |
| Unassigned/Blank | Spoken English LIVE Course | 1,158 |
| Chawkbazar Branch | IELTS Programme | 448 |
| Chawkbazar Branch | Kids English (Class 3 - Class 5) | 39 |
| Chawkbazar Branch | Kids English (KG - Class 2) | 116 |
| Chawkbazar Branch | Spoken English Course | 710 |
| Chawkbazar Branch | Spoken English Junior (Class 6 - Class 10) | 889 |
| Mirpur Branch | After SSC English | 1 |
| Mirpur Branch | IELTS Programme | 672 |
| Mirpur Branch | Kids English (Class 3 - Class 5) | 56 |
| Mirpur Branch | Kids English (KG - Class 2) | 160 |
| Mirpur Branch | Spoken English Course | 852 |
| Mirpur Branch | Spoken English Junior (Class 6 - Class 10) | 706 |
| Moghbazar Branch | IELTS Programme | 366 |
| Moghbazar Branch | Kids English (Class 3 - Class 5) | 49 |
| Moghbazar Branch | Kids English (KG - Class 2) | 60 |
| Moghbazar Branch | Spoken English Course | 323 |
| Moghbazar Branch | Spoken English Junior (Class 6 - Class 10) | 190 |
| Panthapath Branch | IELTS Programme | 454 |
| Panthapath Branch | Kids English (Class 3 - Class 5) | 31 |
| Panthapath Branch | Kids English (KG - Class 2) | 79 |
| Panthapath Branch | Spoken English Course | 462 |
| Panthapath Branch | Spoken English Junior (Class 6 - Class 10) | 300 |
| Uttara Branch | IELTS Programme | 769 |
| Uttara Branch | Kids English (Class 3 - Class 5) | 68 |
| Uttara Branch | Kids English (KG - Class 2) | 149 |
| Uttara Branch | Spoken English Course | 962 |
| Uttara Branch | Spoken English Junior (Class 6 - Class 10) | 1,606 |

If useful, I can also reshape this into a pivot table format like:

| Branch | IELTS | SE Junior | Spoken English | Kids KG-2 | Kids 3-5 | Total |',NULL,NULL,'2026-03-12 05:28:04.944304+00'),
('6bfd0fd6-d0bc-472c-b6b9-29fdf4eb9bc2','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','RTA, branch wise feb 1-28, provide in a table',NULL,NULL,'2026-03-12 05:29:20.930249+00'),
('8a883ffc-0e28-4ac0-babc-c8c8aaa90002','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Here is the branch-wise RTA table for 1 Feb to 28 Feb:

| Branch | Registrations | Attendance | RTA |
|---|---:|---:|---:|
| Unassigned/Blank Branch | 1,473 | 0 | 0.00% |
| Chawkbazar Branch | 2,148 | 223 | 10.38% |
| Mirpur Branch | 2,380 | 352 | 14.79% |
| Moghbazar Branch | 965 | 170 | 17.62% |
| Panthapath Branch | 1,286 | 232 | 18.04% |
| Uttara Branch | 3,379 | 253 | 7.49% |

If you want, I can also provide:
- overall RTA for this period
- programme-wise RTA within each branch
- same table excluding unassigned branch data',NULL,NULL,'2026-03-12 05:29:32.845424+00'),
('c4b1bdac-645a-496e-b82a-2a8096ac552f','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','RTA, branch wise, program wise, feb 1-28, provide in a table',NULL,NULL,'2026-03-12 05:30:47.236381+00'),
('dee957e6-dec0-4604-9143-a1681d8443d0','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam, Feb 1–28 branch-wise, programme-wise RTA table is below.

| Branch | Programme | Registrations | Attendance | RTA |
|---|---|---:|---:|---:|
| Chawkbazar Branch | IELTS Programme | 448 | 79 | 17.63% |
| Chawkbazar Branch | Kids English (Class 3 - Class 5) | 39 | 11 | 28.21% |
| Chawkbazar Branch | Kids English (KG - Class 2) | 116 | 29 | 25.00% |
| Chawkbazar Branch | Spoken English Course | 710 | 63 | 8.87% |
| Chawkbazar Branch | Spoken English Junior (Class 6 - Class 10) | 889 | 49 | 5.51% |
| Mirpur Branch | After SSC English | 1 | 0 | 0.00% |
| Mirpur Branch | IELTS Programme | 672 | 143 | 21.28% |
| Mirpur Branch | Kids English (Class 3 - Class 5) | 56 | 22 | 39.29% |
| Mirpur Branch | Kids English (KG - Class 2) | 160 | 36 | 22.50% |
| Mirpur Branch | Spoken English Course | 852 | 93 | 10.92% |
| Mirpur Branch | Spoken English Junior (Class 6 - Class 10) | 706 | 62 | 8.78% |
| Moghbazar Branch | IELTS Programme | 366 | 79 | 21.58% |
| Moghbazar Branch | Kids English (Class 3 - Class 5) | 49 | 16 | 32.65% |
| Moghbazar Branch | Kids English (KG - Class 2) | 60 | 17 | 28.33% |
| Moghbazar Branch | Spoken English Course | 323 | 40 | 12.38% |
| Moghbazar Branch | Spoken English Junior (Class 6 - Class 10) | 190 | 21 | 11.05% |
| Panthapath Branch | IELTS Programme | 454 | 106 | 23.35% |
| Panthapath Branch | Kids English (Class 3 - Class 5) | 31 | 10 | 32.26% |
| Panthapath Branch | Kids English (KG - Class 2) | 79 | 23 | 29.11% |
| Panthapath Branch | Spoken English Course | 462 | 72 | 15.58% |
| Panthapath Branch | Spoken English Junior (Class 6 - Class 10) | 300 | 24 | 8.00% |
| Uttara Branch | IELTS Programme | 769 | 87 | 11.31% |
| Uttara Branch | Kids English (Class 3 - Class 5) | 68 | 8 | 11.76% |
| Uttara Branch | Kids English (KG - Class 2) | 149 | 35 | 23.49% |
| Uttara Branch | Spoken English Course | 962 | 86 | 8.94% |
| Uttara Branch | Spoken English Junior (Class 6 - Class 10) | 1606 | 40 | 2.49% |

Excluded from the clean branch-wise table because branch/programme was null or unclear:
- Blank Branch + Blank Programme: 315 regs, 0 att., 0.00%
- Blank Branch + Spoken English LIVE Course: 1,158 regs, 0 att., 0.00%

If you want, I can also give this as:
1. branch total RTA,
2. programme total RTA across all branches, or
3. a pivot-style table.',NULL,NULL,'2026-03-12 05:31:03.960411+00'),
('1373e5f6-df51-433b-a223-8d18b4ce8da2','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','ATA, branch wise feb 1-28, provide in a table',NULL,NULL,'2026-03-12 05:32:20.72047+00'),
('812561b1-7cbb-450c-891b-dfc7c863a758','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam, here is the branch-wise ATA for 1 Feb to 28 Feb:

| Branch | Attendance | Admissions | ATA |
|---|---:|---:|---:|
| Uttara Branch | 264 | 20 | 7.58% |
| Moghbazar Branch | 176 | 12 | 6.82% |
| Chawkbazar Branch | 232 | 12 | 5.17% |
| Panthapath Branch | 263 | 12 | 4.56% |
| Mirpur Branch | 384 | 11 | 2.86% |

Highest ATA: Uttara Branch at 7.58%  
Lowest ATA: Mirpur Branch at 2.86%',NULL,NULL,'2026-03-12 05:32:30.632821+00'),
('c2804d3b-54f5-451a-8bbb-c313b14c06e7','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','walk-ins, branch wise feb 1-28, provide in a table',NULL,NULL,'2026-03-12 05:36:55.660569+00'),
('88d567ab-d8bf-4b4e-abb7-a7f5b9ec218b','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam, Feb 1–28 branch-wise walk-ins are below.

| Branch | Walk-ins |
|---|---:|
| Chawkbazar Branch | 141 |
| Mirpur Branch | 27 |
| Moghbazar Branch | 64 |
| Panthapath Branch | 131 |
| Uttara Branch | 70 |

If you want, I can also add:
- total walk-ins,
- branch-wise share %,
- or walk-in admissions alongside this table.',NULL,NULL,'2026-03-12 05:37:20.524364+00'),
('98434488-8870-4bba-b6a8-e173a749c40c','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','walk-ins, branch wise program wise feb 1-28, provide in a table',NULL,NULL,'2026-03-12 05:40:57.556545+00'),
('299011d7-fa1b-4d88-88d5-361eda02deb8','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam, here are the branch-wise, program-wise walk-ins for 1 Feb to 28 Feb:

| Branch | Programme | Walk-ins |
|---|---|---:|
| Chawkbazar Branch | Unspecified | 24 |
| Chawkbazar Branch | After SSC English | 1 |
| Chawkbazar Branch | English Foundation Programme | 2 |
| Chawkbazar Branch | English Olympiad | 1 |
| Chawkbazar Branch | IELTS Programme | 33 |
| Chawkbazar Branch | Kids English | 17 |
| Chawkbazar Branch | Spoken English Course | 42 |
| Chawkbazar Branch | Spoken English Junior (Class 6 - Class 10) | 24 |
| Mirpur Branch | Unspecified | 13 |
| Mirpur Branch | English Foundation Programme | 2 |
| Mirpur Branch | IELTS Programme | 8 |
| Mirpur Branch | Kids English | 1 |
| Mirpur Branch | Spoken English Course | 1 |
| Mirpur Branch | Spoken English Junior (Class 6 - Class 10) | 2 |
| Moghbazar Branch | Unspecified | 35 |
| Moghbazar Branch | English Foundation Programme | 4 |
| Moghbazar Branch | IELTS Programme | 10 |
| Moghbazar Branch | Kids English | 5 |
| Moghbazar Branch | Spoken English Course | 3 |
| Moghbazar Branch | Spoken English Junior (Class 6 - Class 10) | 7 |
| Panthapath Branch | Unspecified | 33 |
| Panthapath Branch | After SSC English | 2 |
| Panthapath Branch | English Foundation Programme | 8 |
| Panthapath Branch | English Olympiad | 1 |
| Panthapath Branch | IELTS Programme | 55 |
| Panthapath Branch | Kids English | 10 |
| Panthapath Branch | Spoken English Course | 22 |
| Panthapath Branch | Spoken English Junior (Class 6 - Class 10) | 7 |
| Uttara Branch | Unspecified | 22 |
| Uttara Branch | After SSC English | 1 |
| Uttara Branch | English Foundation Programme | 2 |
| Uttara Branch | IELTS Programme | 16 |
| Uttara Branch | Kids English | 11 |
| Uttara Branch | Spoken English Course | 6 |
| Uttara Branch | Spoken English Junior (Class 6 - Class 10) | 12 |

If you want, I can also provide:
- a pivot table version with branches as rows and programmes as columns, or
- branch-wise total walk-ins for the same period.',NULL,NULL,'2026-03-12 05:41:14.734779+00'),
('e8b7938e-c4d4-4e19-93f2-73f1d7b7748f','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','admissions, branch wise feb 1-28, provide in a table',NULL,NULL,'2026-03-12 05:44:59.540982+00'),
('1636c433-e6fe-4f64-be8b-ecf65c6c5a8a','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Here is the branch-wise admissions table for 1 Feb to 28 Feb:

| Branch | Admissions |
|---|---:|
| Chawkbazar Branch | 32 |
| Mirpur Branch | 16 |
| Moghbazar Branch | 20 |
| Panthapath Branch | 23 |
| Uttara Branch | 30 |

Total admissions: 121

If you want, I can also provide:
- branch-wise ATA for this period
- programme-wise admissions within each branch
- branch-wise revenue alongside admissions',NULL,NULL,'2026-03-12 05:45:08.500198+00'),
('86ba2406-5fb3-45d4-a3b0-9471a3fe425b','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','admissions, branch wise feb 1-28, provide in a table, for admission you are supposed to use offline_admssions_gsheet_v3',NULL,NULL,'2026-03-12 05:47:17.078143+00'),
('5812a564-e67a-4aa4-b256-f67841465039','cd42748c-627b-4c4d-ac6e-0b90a6fd7559','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Using `offline_admissions_gsheet_v3`, here is the branch-wise admissions table for 1 Feb to 28 Feb:

| Branch | Admissions |
|---|---:|
| Chawkbazar Branch | 90 |
| Mirpur Branch | 59 |
| Moghbazar Branch | 91 |
| Panthapath Branch | 104 |
| Uttara Branch | 90 |

| Total | 434 |

If you want, I can next give:
- branch-wise ATA for Feb 1–28
- programme-wise admissions by branch
- admissions with revenue by branch',NULL,NULL,'2026-03-12 05:47:27.45867+00'),
('4b844f43-5de4-444d-920c-4547b74e928d','63b58d90-c422-4744-9cdf-af60dafa225c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Show today''s called vs uncalled leads',NULL,NULL,'2026-03-17 18:34:42.336396+00'),
('26feb5de-f798-41ec-9581-b60cea65a4c1','63b58d90-c422-4744-9cdf-af60dafa225c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam, today’s called vs uncalled leads:

- Total tele-eligible leads: 122
- Called leads: 57
- Uncalled leads: 65

Called rate: 46.7%
Uncalled rate: 53.3%',NULL,NULL,'2026-03-17 18:34:53.443933+00'),
('4607e496-9c7b-4d9b-a326-c1fd8ae460d0','f45a6faf-3b05-4578-bbcd-6e4adf77ad82','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Are Facebook leads attending well?',NULL,NULL,'2026-03-17 19:56:41.09079+00'),
('1b00fe32-aa03-4739-8718-58c6bfa12745','79c52620-9b3f-4e7f-8363-ea3832f3f780','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Which branch has the best ATA trend?',NULL,NULL,'2026-03-17 20:03:04.197702+00'),
('dd4c946d-1daf-4568-b0ef-738d0ad700ec','79c52620-9b3f-4e7f-8363-ea3832f3f780','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam — based on this result, **Moghbazar Branch has the best ATA trend overall**.

### Why Moghbazar looks best
- It shows the **most stable high ATA** across a long stretch of months in **2025**
- From **May–Nov 2025**, Moghbazar mostly stayed around **27%–39%**
- It also has a strong peak at **63.0% in May 2025**
- Compared to other branches, it has **less volatility than Mirpur** and **better consistency than Panthapath/Uttara**

### Quick branch view
- **Moghbazar**: best mix of **consistency + strong ATA**
- **Mirpur**: strong mid-2025 performance, but sharper decline later
- **Panthapath**: good periods, but more fluctuation
- **Uttara**: a few strong months, but inconsistent
- **Chawkbazar**: weaker overall than the others

### Important caveat
Some early months have **ATA above 100%** for branches like:
- **Uttara Sep 2024: 321.05%**
- **Panthapath Sep 2024: 113.79%**

These are not reliable for trend judgment and likely happened because the query compares:
- **attendance in a submission month**
vs
- **admissions recorded in that same submission month cohort**

So admissions may not be perfectly aligned with attendance timing. For a cleaner ATA trend, it is better to calculate:

**Admissions from attended users / attended users**, using the same cohort logic and ideally admission after attendance.

### Final answer
If you want a practical business answer from this table: **Moghbazar Branch has the best ATA trend.**

If you want, I can also rank all branches by:
1. **average ATA**
2. **last 6 months ATA**
3. **trend slope / consistency score**',NULL,NULL,'2026-03-17 20:03:19.889394+00'),
('0fca9970-002b-4154-8aba-5e307fc6c4a4','11d6fac5-5de8-438f-87f9-be55dfdc6d6a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Which branch has best ATA?',NULL,NULL,'2026-03-17 20:05:32.952894+00'),
('e026fcbe-cb9f-4903-bf81-c115e7105e29','11d6fac5-5de8-438f-87f9-be55dfdc6d6a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Based on the result, **Uttara Branch has the best ATA**.

### ATA ranking by branch
1. **Uttara Branch** — **29.33%**
2. **Panthapath Branch** — **23.51%**
3. **Moghbazar Branch** — **22.61%**
4. **Mirpur Branch** — **16.46%**
5. **Chawkbazar Branch** — **13.98%**

### Supporting numbers
- **Uttara Branch:** 3,597 attendance, 1,055 admissions
- **Panthapath Branch:** 3,497 attendance, 822 admissions
- **Moghbazar Branch:** 3,477 attendance, 786 admissions
- **Mirpur Branch:** 5,013 attendance, 825 admissions
- **Chawkbazar Branch:** 2,489 attendance, 348 admissions

Note: The result also contains some **null/test branch values**, which should be ignored.

If you want, I can also give you:
- **best ATA for only valid branches cleaned properly**
- **ATA by month**
- **ATA by branch + programme**
- **latest 30 days ATA leaderboard**',NULL,NULL,'2026-03-17 20:05:46.749648+00'),
('22e2a415-72e9-4309-a617-87eaaccfa362','11d6fac5-5de8-438f-87f9-be55dfdc6d6a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','thanks',NULL,NULL,'2026-03-17 20:11:40.617085+00'),
('31eef796-3f19-4ea5-a417-4f9b600734a0','11d6fac5-5de8-438f-87f9-be55dfdc6d6a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam. You’re welcome.',NULL,NULL,'2026-03-17 20:11:44.904309+00'),
('d6453566-2a73-4efd-aa48-7eb5529d6929','c4490d4f-65cd-4a1a-ad4e-ce25f19348dd','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Show admissions by Jogodish Ghosh this month',NULL,NULL,'2026-03-17 20:48:25.487597+00'),
('f523b247-75f5-4c9e-a8a4-48beb6e6141e','c4490d4f-65cd-4a1a-ad4e-ce25f19348dd','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam, Jogodish Ghosh has **0 admissions** this month so far.',NULL,NULL,'2026-03-17 20:48:34.303976+00'),
('95e308bb-d39b-4d78-9588-b292299e04b4','7fb72542-ce08-4ed6-9f7a-e122987f46a1','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Which lead source brings weak attendance?',NULL,NULL,'2026-03-18 07:15:43.488513+00'),
('2561919d-61d3-4745-87d6-48329cf1b483','c136d7a1-8e17-40e5-96fa-8287706019a4','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Show IELTS attendance this month',NULL,NULL,'2026-03-18 07:46:31.109746+00'),
('72fcc956-9375-4c39-8b60-4c42f30b1ff3','7fb72542-ce08-4ed6-9f7a-e122987f46a1','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam,

These lead sources are bringing the weakest attendance based on lowest RTA:

### Very weak / likely problematic
- **Spoken English LIVE Course** — 5,765 regs, **0 attendance**, **0.00% RTA**
- **Free Class Social (Manual)** — 3,018 regs, **0 attendance**, **0.00% RTA**
- **Kids English December** — 1,013 regs, **0 attendance**, **0.00% RTA**
- **Offline Centre Outbound** — 13,950 regs, 7 attendance, **0.05% RTA**
- **Spoken English December** — 1,179 regs, 4 attendance, **0.34% RTA**
- **Offline Centre Static** — 6,696 regs, 44 attendance, **0.66% RTA**
- **School Activation** — 2,237 regs, 17 attendance, **0.76% RTA**
- **Free Class MPB** — 2,883 regs, 27 attendance, **0.94% RTA**

### Other weak sources
- **Free Class Activation** — **1.30%**
- **Offline Centre Activation** — **2.09%**
- **Offline Centre May** — **3.14%**
- **Offline Centre March** — **3.15%**
- **Offline Centre January** — **3.31%**
- **Offline Centre December** — **3.58%**
- **Offline Centre February** — **4.46%**
- **Offline Centre April** — **4.74%**

### Key takeaways
- The most concerning ones are the sources with **0% or near-0% attendance**, especially:
  - **Spoken English LIVE Course**
  - **Free Class Social (Manual)**
  - **Kids English December**
  - **Offline Centre Outbound**
- Some of these may be genuinely weak sources, but some also look like **mapping / attendance linkage issues** because zero attendance at this scale is unusual.

### Practical interpretation
If you want sources that are both **large volume + weak attendance**, prioritize checking:
1. **Offline Centre Outbound** — huge volume, almost no attendance
2. **Offline Centre Static**
3. **Free Class Social (Manual)**
4. **Spoken English LIVE Course**
5. **Offline Centre Activation**
6. **Free Class MPB**

If you want, I can also group these into:
- **Likely data issue**
- **Likely poor-quality lead source**
- **Need Calling Ops intervention**','dislike','Test','2026-03-18 07:16:02.152416+00'),
('41261a48-ccd8-40e9-9702-5fb1caaf63ed','6cc79d7c-008c-4ed5-bda6-19c6d3375428','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Show today''s registrations by branch',NULL,NULL,'2026-03-18 07:31:00.61583+00'),
('2855f226-1ee8-40eb-ba78-ab17c75db6dd','6cc79d7c-008c-4ed5-bda6-19c6d3375428','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam, today’s registrations by branch:

- Mirpur Branch: 20
- Uttara Branch: 20
- Chawkbazar Branch: 19
- Moghbazar Branch: 11
- Panthapath Branch: 11

Total: 81 registrations

If you want, I can also show this split by programme or source for today.','like',NULL,'2026-03-18 07:31:08.363415+00'),
('51f0a06c-a5d3-41ec-b611-f9cd1447794b','c136d7a1-8e17-40e5-96fa-8287706019a4','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam,

**IELTS attendance this month:** **92**

| Metric | Value |
|---|---:|
| IELTS Free Class Attendance | 92 |

If you want, I can also break this down by **branch**, **date**, or compare it with **last month**.',NULL,NULL,'2026-03-18 07:46:39.997173+00'),
('a86ef239-0a5a-488b-9f45-d1e82a8afbf8','c136d7a1-8e17-40e5-96fa-8287706019a4','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','give me tips',NULL,NULL,'2026-03-18 07:46:50.301085+00'),
('c85e7c11-6019-412e-812f-8ef7570e06a4','c7fa36ba-cd9d-48cc-b11e-634b094fbccf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, BI.

How can I help you with EC data today?

You can ask for things like:
- registrations, attendance, admissions
- RTA or ATA
- branch-wise or programme-wise performance
- ADO-wise admissions or revenue
- walk-ins and walk-in admissions
- collection, booking, due, or installment trends
- CX / calling ops metrics','like',NULL,'2026-03-21 19:43:59.248538+00'),
('a50a88da-1698-49fc-a565-b6d10d20e527','c136d7a1-8e17-40e5-96fa-8287706019a4','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb. Here are a few quick tips for using EC Data Agent effectively:

1. Be specific with scope
- Mention branch, programme, date range, source, or owner.
- Example: “Show Mirpur branch registrations and attendance for last 7 days.”

2. Mention the metric clearly
- Use terms like registrations, attendance, admissions, RTA, ATA, walk-ins, revenue, collection, due.
- Example: “Give branch-wise ATA for this month.”

3. Ask for the format you want
- You can ask for summary, table, comparison, trend, top/bottom performers, or insight bullets.
- Example: “Give a short summary with a markdown table.”

4. For ops follow-up, ask action-oriented questions
- Example: “Which branches are weak in attendance this week?”
- Example: “Which ADOs have high due but low collection?”

5. For CX or tele analysis, mention calling scope
- Example: “Show last 30 days tele-eligible vs dialled by submission date.”
- Example: “Give absent leads by branch and programme.”

6. For admissions and revenue, separate booking vs collection
- Booking = expected total revenue
- Collection = actually received amount
- Tip: asking both together avoids confusion.

7. If you want cleaner analysis, ask for exclusions
- Example: “Exclude IELTS Mock Test and Study Abroad.”
- Example: “Only new leads.”

8. Use comparison prompts
- Example: “Compare Uttara vs Panthapath for registrations, attendance and admissions in March.”

9. Ask for drill-down when needed
- Start branch-wise, then programme-wise, then ADO-wise.
- This usually gives faster decision-making.

10. Good prompt examples

| Use case | Better prompt |
|---|---|
| Lead performance | Show branch-wise registrations, attendance, admissions, RTA and ATA for last 14 days |
| Revenue | Show collection, booking, due and admission count by branch for this month |
| ADO review | Show ADO-wise admissions and collection for Panthapath this month |
| CX review | Show tele-eligible, reached, pitched, confirmed and attendance for last 30 days |
| Programme trend | Compare IELTS and Spoken English Course performance for last 4 weeks |

If you want, I can also give you:
- 20 ready-to-use prompt templates
- role-based prompt suggestions for BM / ADO / CX / BI
- a compact cheat sheet for all EC metrics','like',NULL,'2026-03-18 07:47:03.850587+00'),
('8c00e23e-c928-4801-a530-262a34fa4794','365c618a-c872-45b6-a73e-0bf0dd705a50','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Which branch dropped most this week?',NULL,NULL,'2026-03-18 07:59:30.682541+00'),
('3421fad6-6ce2-4b51-b3bd-c25544516a86','365c618a-c872-45b6-a73e-0bf0dd705a50','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

The biggest drop this week was in **Chawkbazar Branch**.

| Branch | Last Week Regs | This Week Regs | Drop |
|---|---:|---:|---:|
| Chawkbazar Branch | 646 | 475 | **-171** |
| Moghbazar Branch | 269 | 167 | -102 |
| Mirpur Branch | 572 | 472 | -100 |
| Panthapath Branch | 251 | 153 | -98 |
| Uttara Branch | 716 | 635 | -81 |

There is also one **blank/null branch** entry:

| Branch | Last Week Regs | This Week Regs | Drop |
|---|---:|---:|---:|
| Unassigned / blank branch | 315 | 220 | -95 |

**Answer:** Chawkbazar Branch dropped the most, by **171 registrations WoW**.

If you want, I can also give you:
1. **drop % by branch**
2. **only active valid branches excluding null**
3. **a quick reason-cut by lead source/programme for Chawkbazar**',NULL,NULL,'2026-03-18 07:59:44.176905+00'),
('2d430b39-b894-4a81-8fe9-04557441d4f8','365c618a-c872-45b6-a73e-0bf0dd705a50','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Give me some tips',NULL,NULL,'2026-03-18 08:00:05.185951+00'),
('a1f4552a-e349-4b01-b8ca-7697e26a05b7','365c618a-c872-45b6-a73e-0bf0dd705a50','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Since **Chawkbazar Branch** dropped the most this week, here are some practical checks and action points:

### Immediate tips for Chawkbazar

1. **Check lead source mix**
   - Compare this week vs last week by **lead_source** and **data_source**.
   - See whether the drop came mainly from **Facebook Form**, **Booking System**, or a specific campaign source.

2. **Check programme-wise drop**
   - Break Chawkbazar registrations by programme.
   - This will show whether the decline is mainly from **IELTS**, **Spoken English**, **SEJ**, or **Kids English**.

3. **Check class slot availability**
   - If fewer free class slots were opened in ERP, registrations naturally fall.
   - Good to verify with the **CM team** whether routine or slots were missing or uploaded late.

4. **Check day-wise pattern**
   - See which exact day dropped the most this week.
   - That usually helps identify whether it was a one-day issue or a full-week demand issue.

5. **Review ad delivery and campaign continuity**
   - If MPB changed budget, paused ads, or shifted focus, Chawkbazar may have received less volume.
   - A branch-level lead source view will confirm this quickly.

6. **Check booking-to-attendance health too**
   - Even if regs dropped, attendance may still be manageable.
   - If both regs and attendance dropped together, then it is a broader funnel issue.

7. **Check repeat vs new lead mix**
   - If new leads fell sharply but old/repeat leads stayed similar, acquisition may be the main issue.

### Suggested next cuts

If you want to diagnose this properly, I’d suggest these 3 cuts first:

| Priority | Analysis | Why it helps |
|---|---|---|
| 1 | Chawkbazar branch by lead source | Finds which source caused the drop |
| 2 | Chawkbazar branch by programme | Finds which product demand weakened |
| 3 | Chawkbazar day-wise this week vs last week | Finds when the fall happened |

### Recommended next step

I can pull any of these for you next:

1. **Chawkbazar drop by lead source**
2. **Chawkbazar drop by programme**
3. **Day-wise comparison for all branches**
4. **Drop % ranking instead of absolute drop**

',NULL,NULL,'2026-03-18 08:00:19.115995+00'),
('5bc30d5c-11f8-4922-86d1-26ee79ded4e6','4518b3e9-4d97-40f2-8c26-f62d78257522','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Who am i',NULL,NULL,'2026-03-18 08:05:16.588204+00'),
('b6a47ae6-3a1b-447e-9f6a-40e307263a18','4518b3e9-4d97-40f2-8c26-f62d78257522','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb. You are Uttam Deb, BI from the Data & AI team at 10 Minute School and the primary data stakeholder for English Centre operations. You also built this EC Data Agent.

You usually work with:

| Area | Your involvement |
|---|---|
| BI & reporting | G99 dashboard, Metabase, and reporting support |
| Data stakeholder | EC data definitions, validation, and analysis |
| Ops support | Registrations, Attendance, Admissions, RTA, ATA, walk-ins, revenue |
| Systems | ClassroomOS, Booking System, and related data flows |

If you want, I can also help you with EC metrics, branch-wise performance, ADO-wise admissions, CX calling data, or revenue analysis.',NULL,NULL,'2026-03-18 08:05:24.33921+00')
ON CONFLICT (id) DO NOTHING;