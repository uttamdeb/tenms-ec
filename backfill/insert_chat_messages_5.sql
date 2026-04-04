INSERT INTO public.chat_messages (id,session_id,user_id,role,content,feedback,feedback_note,created_at) VALUES
('b7668775-a1ec-49d0-8cbf-8eb12633323c','d7c282e1-2d10-4556-9633-195771d978ad','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam! Based on the performance data for the current month, I have analyzed the metrics for Admission Officers (ADOs) across all branches. 

To identify the "weakest" performance, I looked at total admissions, revenue collection, and conversion from visitors (Walk-ins and Free Class visitors).

### **Bottom Performing ADOs (Current Month)**

| ADO Name | Branch | Admissions | Collected Amount (BDT) | Total Visitors Handled |
| :--- | :--- | :--- | :--- | :--- |
| **Farjana Hasan Mim** | Mirpur | 3 | 36,500 | 2 |
| **Farjana Karim Eva** | Chawkbazar | 4 | 37,500 | 39 |
| **Nilufar Sultana Puspo**| Chawkbazar | 5 | 22,700 | 48 |
| **Touhidul Islam Maruf**| Uttara | 0 | 0 | 12 |

### **Key Observations:**
1.  **Lowest Volume:** **Farjana Hasan Mim** (Mirpur) has the lowest number of admissions (3) so far this month.
2.  **Low Conversion:** **Farjana Karim Eva** (Chawkbazar) has handled a high volume of 39 visitors (15 walk-ins and 24 free class visitors) but has only converted 4 of them into admissions.
3.  **Revenue & Yield:** **Nilufar Sultana Puspo** (Chawkbazar) has the lowest collection amount (22,700 BDT) among those with multiple admissions, indicating a lower average transaction value or higher pending installments.
4.  **Zero Conversions:** **Touhidul Islam Maruf** (Uttara) has handled 12 visitors this month but is yet to record his first admission.

```chart
{
  "type": "bar",
  "title": "Admissions Comparison (Bottom Performers)",
  "description": "Comparison of admissions for the ADOs with the lowest numbers this month.",
  "xKey": "name",
  "series": [
    {
      "key": "admissions",
      "label": "Total Admissions",
      "color": "#ef4444"
    }
  ],
  "data": [
    {
      "name": "Farjana Hasan Mim",
      "admissions": 3
    },
    {
      "name": "Farjana Karim Eva",
      "admissions": 4
    },
    {
      "name": "Nilufar Puspo",
      "admissions": 5
    },
    {
      "name": "Touhidul Maruf",
      "admissions": 0
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Admissions"
  }
}
```

Would you like me to pull up the detailed conversion rates (ATA) for these specific individuals to see if the issue is visitor quality or desk conversion?',NULL,NULL,'2026-03-31 06:59:30.694362+00'),
('c53c8480-ce18-4b20-a0bf-96e507c04a65','d8499d6a-0f96-4ff2-a1a7-c8a49f51e62e','06ab655c-63d6-4258-97e1-d0dc176b3cac','assistant','Hello Sanjida!

Here is the comparison between registrations and attendance for the free classes scheduled on March 30th, 2026, broken down by branch and programme:

| Branch | Programme | Registrations | Attendance | RTA (%) |
| :--- | :--- | :---: | :---: | :---: |
| **Panthapath Branch** | Kids English (KG - Class 2) | 48 | 11 | 22.92% |
| **Mirpur Branch** | Kids English (KG - Class 2) | 83 | 14 | 16.87% |
| **Uttara Branch** | Kids English (Class 3 - Class 5) | 22 | 2 | 9.09% |
| **Moghbazar Branch** | Kids English (KG - Class 2) | 46 | 4 | 8.70% |
| **Chawkbazar Branch** | Kids English (Class 3 - Class 5) | 16 | 1 | 6.25% |
| **Moghbazar Branch** | Spoken English Course | 66 | 4 | 6.06% |
| **Uttara Branch** | Kids English (KG - Class 2) | 70 | 0 | 0.00% |

```chart
{
  "type": "bar",
  "title": "Registrations vs. Attendance (March 30, 2026)",
  "description": "Comparison of user registrations versus actual attendance across different branches and programmes for the free classes on March 30th.",
  "xKey": "label",
  "series": [
    {
      "key": "registrations",
      "label": "Registrations",
      "color": "#3b82f6"
    },
    {
      "key": "attendance",
      "label": "Attendance",
      "color": "#10b981"
    }
  ],
  "data": [
    {
      "label": "Mirpur (Kids KG-2)",
      "registrations": 83,
      "attendance": 14
    },
    {
      "label": "Uttara (Kids KG-2)",
      "registrations": 70,
      "attendance": 0
    },
    {
      "label": "Moghbazar (Spoken)",
      "registrations": 66,
      "attendance": 4
    },
    {
      "label": "Panthapath (Kids KG-2)",
      "registrations": 48,
      "attendance": 11
    },
    {
      "label": "Moghbazar (Kids KG-2)",
      "registrations": 46,
      "attendance": 4
    },
    {
      "label": "Uttara (Kids 3-5)",
      "registrations": 22,
      "attendance": 2
    },
    {
      "label": "Chawkbazar (Kids 3-5)",
      "registrations": 16,
      "attendance": 1
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Count"
  }
}
```

**Key Observations:**
*   **Panthapath Branch** achieved the highest RTA (22.92%) for the Kids English (KG - Class 2) programme.
*   **Mirpur Branch** had the highest volume of registrations (83) and the most attendees (14) for a single slot.
*   **Uttara Branch** saw a significant gap for Kids English (KG - Class 2), where 70 users registered but none attended. This might require a quick check with the Calling Ops team to see if there were any communication issues.',NULL,NULL,'2026-03-31 06:59:36.404363+00'),
('9517365d-6bb5-4ff4-9f8e-904dd48d51b4','d8499d6a-0f96-4ff2-a1a7-c8a49f51e62e','06ab655c-63d6-4258-97e1-d0dc176b3cac','user','now make it for March 1st to March 30.',NULL,NULL,'2026-03-31 06:59:54.448138+00'),
('6cafcdba-e304-4e84-9f47-7346bda91f02','d8499d6a-0f96-4ff2-a1a7-c8a49f51e62e','06ab655c-63d6-4258-97e1-d0dc176b3cac','assistant','Hello Sanjida!

For the period of March 1st to March 30th, 2026, here is the total free class attendance count across all English Centres:

| Date Range | Total Attendance |
| :--- | :--- |
| March 01 - March 30, 2026 | 553 |

A total of **553 unique students** attended their free classes during this timeframe. 

As the Product Manager for the Booking System and ClassroomOS, this volume reflects the number of users the platform successfully managed for on-ground attendance across all branches within this month. Let me know if you would like to see this broken down by branch or by specific programmes!',NULL,NULL,'2026-03-31 07:00:07.774126+00'),
('82c7338e-0afc-4f80-970c-c9434721f3e4','d8499d6a-0f96-4ff2-a1a7-c8a49f51e62e','06ab655c-63d6-4258-97e1-d0dc176b3cac','user','merge the both registered for march 1st to March 30th free class vs attendance',NULL,NULL,'2026-03-31 07:00:26.618451+00'),
('2d255b41-a65c-4c2a-b6a9-0b77089259cf','d8499d6a-0f96-4ff2-a1a7-c8a49f51e62e','06ab655c-63d6-4258-97e1-d0dc176b3cac','assistant','Hi Sanjida Siddiqua! 

For the period of March 1st to March 30th, I have merged the registration and attendance data for you. This view is particularly useful for evaluating the **RTA (Registration to Attendance)** performance of each programme via the Booking System.

Here is the breakdown by programme:

| Programme | Registrations | Attendance | RTA % |
| :--- | :--- | :--- | :--- |
| **Spoken English Course** | 3,465 | 185 | 5.34% |
| **Spoken English Junior (Class 6 - 10)** | 2,698 | 77 | 2.85% |
| **Kids English** | 1,726 | 142 | 8.23% |
| **IELTS Programme** | 1,437 | 114 | 7.93% |
| **After SSC English** | 2 | 0 | 0.00% |
| **Total** | **9,328** | **518** | **5.55%** |

```chart
{
  "type": "bar",
  "title": "Programme-wise Regs vs Attendance (Mar 1 - Mar 30)",
  "description": "A comparison between the number of users who registered for a free class and those who actually attended, segmented by programme group.",
  "xKey": "programme",
  "series": [
    {
      "key": "registrations",
      "label": "Registrations",
      "color": "#3b82f6"
    },
    {
      "key": "attendance",
      "label": "Attendance",
      "color": "#10b981"
    }
  ],
  "data": [
    { "programme": "Spoken English Course", "registrations": 3465, "attendance": 185 },
    { "programme": "Spoken English Junior", "registrations": 2698, "attendance": 77 },
    { "programme": "Kids English", "registrations": 1726, "attendance": 142 },
    { "programme": "IELTS Programme", "registrations": 1437, "attendance": 114 }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Count"
  }
}
```

**Key takeaways for your product review:**
*   **Kids English** and **IELTS** have the highest RTA conversion rates (~8%), suggesting that users booking these programmes through our system are more likely to show up at the centres.
*   **Spoken English Junior** has a significantly lower RTA (2.85%) compared to other categories, which might be an area for further investigation regarding lead quality or calling operations follow-ups.

Let me know if you would like to see this breakdown specifically for individual branches or lead sources!',NULL,NULL,'2026-03-31 07:00:56.52041+00'),
('d85e22be-cdab-494b-8b24-19a6948cd1fa','d8499d6a-0f96-4ff2-a1a7-c8a49f51e62e','06ab655c-63d6-4258-97e1-d0dc176b3cac','user','merge the both registered for march 1st to March 30th free class vs attendance, branch wise',NULL,NULL,'2026-03-31 07:01:17.935728+00'),
('5f703b90-c8f0-4eb0-a8ef-f87323ed71ed','67edf53e-b311-40d5-a55d-a69d28f78ca7','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','which branch is doign better with conversions in 2026?',NULL,NULL,'2026-04-02 06:13:45.456728+00'),
('9f3e9c12-7b30-4fe0-8476-257e838542dc','d8499d6a-0f96-4ff2-a1a7-c8a49f51e62e','06ab655c-63d6-4258-97e1-d0dc176b3cac','assistant','Hello Sanjida Siddiqua! 

Here is the branch-wise breakdown of free class registrations versus actual attendance for the period of March 1st to March 30th. This provides a clear picture of how each branch is performing in terms of converting digital leads into physical visits (RTA).

| Branch | Registrations | Attendance | RTA % |
| :--- | :--- | :--- | :--- |
| **Uttara Branch** | 3,027 | 63 | 2.08% |
| **Mirpur Branch** | 2,264 | 146 | 6.45% |
| **Chawkbazar Branch** | 2,248 | 125 | 5.56% |
| **Moghbazar Branch** | 1,001 | 93 | 9.29% |
| **Panthapath Branch** | 951 | 89 | 9.36% |
| **Total** | **9,491** | **516** | **5.44%** |

```chart
{
  "type": "bar",
  "title": "Branch-wise Regs vs Attendance (Mar 1 - Mar 30)",
  "description": "Comparison of lead volume and actual attendance counts across different English Centres.",
  "xKey": "branch",
  "series": [
    {
      "key": "registrations",
      "label": "Registrations",
      "color": "#3b82f6"
    },
    {
      "key": "attendance",
      "label": "Attendance",
      "color": "#10b981"
    }
  ],
  "data": [
    { "branch": "Uttara", "registrations": 3027, "attendance": 63 },
    { "branch": "Mirpur", "registrations": 2264, "attendance": 146 },
    { "branch": "Chawkbazar", "registrations": 2248, "attendance": 125 },
    { "branch": "Moghbazar", "registrations": 1001, "attendance": 93 },
    { "branch": "Panthapath", "registrations": 951, "attendance": 89 }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Count"
  }
}
```

**Key Insights for Product & Ops:**
*   **Highest Volume:** **Uttara Branch** generated the most interest through the booking systems with over 3,000 registrations.
*   **Best Conversion (RTA):** **Panthapath (9.36%)** and **Moghbazar (9.29%)** are leading in terms of conversion efficiency, meaning users who book for these branches are much more likely to show up.
*   **Opportunity:** Uttara has a very high lead volume but a lower RTA (2.08%). This might be a good point to review with the Calling Ops team or check if there are any specific friction points in the booking flow for that branch.

Let me know if you need any further filtering by program or specific lead sources!',NULL,NULL,'2026-03-31 07:01:39.721645+00'),
('fcf950b2-44af-4751-b2dd-02bf3a381740','edee87a7-ce9b-4e74-a6df-eb089cf89bc4','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','tell me how does is uttara branch performing',NULL,NULL,'2026-03-31 07:08:58.32489+00'),
('e5dc7782-a871-424b-820e-9ab7abcda0fe','edee87a7-ce9b-4e74-a6df-eb089cf89bc4','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-31 07:09:07.286761+00'),
('c9d8291d-0da3-4f46-b25b-ac44dba05a5a','edee87a7-ce9b-4e74-a6df-eb089cf89bc4','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','tell me how does is uttara branch performing?',NULL,NULL,'2026-03-31 07:09:35.507088+00'),
('7105bd5f-92ec-4c8d-abc8-2648f0595b0a','edee87a7-ce9b-4e74-a6df-eb089cf89bc4','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-31 07:09:44.26477+00'),
('c6f05061-03ea-43eb-8e25-4f0780b3cbbc','18a85a46-4384-482c-999a-179a44bfcadd','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','tell me how does is uttara branch performing',NULL,NULL,'2026-03-31 07:10:37.688944+00'),
('9d2ecb94-51bf-493c-bde6-f13cb546e80a','2130dc51-0fe7-47c9-acf2-48836953f49a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','how is uttara branch performing in 202^?',NULL,NULL,'2026-03-31 07:12:34.925812+00'),
('79fd6716-12f6-47dc-9f8c-65e425c12266','2130dc51-0fe7-47c9-acf2-48836953f49a','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-31 07:12:45.210176+00'),
('da51ca94-114d-4976-87fb-a4ad14999d65','1b0a8113-d5ce-4dc1-8390-f2537abb91a9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','how is uttara branch performing in 2026?',NULL,NULL,'2026-03-31 07:12:49.925727+00'),
('14af50ea-9226-4462-87c7-bbbbbd3db70e','1b0a8113-d5ce-4dc1-8390-f2537abb91a9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam! Here is the performance overview for the Uttara Branch for the year 2026.

### **Core Performance Metrics (2026)**

The branch has seen a high volume of registrations, though the conversion through the free class funnel (RTA and ATA) shows room for improvement compared to the volume of walk-in conversions.

| Metric | Achievement |
| :--- | :--- |
| **Registrations (Leads)** | 13,436 |
| **Free Class Attendance** | 885 |
| **Admissions (Lead-based)** | 71 |
| **RTA (Registration to Attendance)** | 6.59% |
| **ATA (Attendance to Admissions)** | 8.02% |
| **Walk-ins** | 297 |
| **Walk-in Admissions** | 172 |
| **Revenue Collection** | 5,802,690 BDT |
| **Total Paying Students** | 425 |

```chart
{
  "type": "bar",
  "title": "Uttara Branch Marketing Funnel 2026",
  "description": "Funnel breakdown from Registrations to Admissions for Uttara Branch in 2026.",
  "xKey": "stage",
  "series": [
    {
      "key": "count",
      "label": "Users",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "stage": "Registrations",
      "count": 13436
    },
    {
      "stage": "Attendance",
      "count": 885
    },
    {
      "stage": "Admissions",
      "count": 71
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Number of Users"
  }
}
```

### **Key Insights:**

*   **Funnel Efficiency:** While the branch generated over 13,000 leads, the **RTA stands at 6.59%**, indicating a potential gap in the calling operations or lead quality. 
*   **Walk-in Strength:** There is a very strong conversion rate for walk-ins. Out of **297 walk-ins, 172 converted to admissions**, which significantly outperforms the lead-based admission count (71).
*   **Revenue:** The branch has collected a total of **5,802,690 BDT** from 425 unique paying students (this includes both new admissions and installment collections from existing students).

Please let me know if you need a further breakdown by programme or a month-on-month trend for Uttara.',NULL,NULL,'2026-03-31 07:13:24.099723+00'),
('148e39f0-d4f1-4e7c-a7a7-54b7163f582e','04a12aa0-fa54-4af7-b65f-2df30dce7491','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','conduct a deep analysis of admission and ATA related data from late 2025 to current date. Trends, issues, scopes of improvement.',NULL,NULL,'2026-03-31 08:45:16.788705+00'),
('677baf78-a8d4-4074-9f0c-65d8aa2bcd27','04a12aa0-fa54-4af7-b65f-2df30dce7491','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello, Uttam! As the developer of this system, it''s great to provide you with this deep dive into the English Center''s performance from October 2025 to March 2026.

Based on the data, we saw a massive scale-up in activity starting in January 2026, driven largely by the English Olympiad. However, this scale has brought significant challenges in conversion efficiency (ATA) and due collection.

### 1. Overall Admission & Revenue Trends
Admissions peaked sharply in **January 2026** with **1,036 total enrollments** across all branches, more than double the previous month. While booking revenue followed this trend, the "Due Amount" also spiked significantly in the same period.

```chart
{
  "type": "line",
  "title": "Monthly Admission Trends (Oct 2025 - Mar 2026)",
  "description": "Total admissions across all branches showing the peak in January 2026.",
  "xKey": "month",
  "series": [
    {
      "key": "admissions",
      "label": "Total Admissions",
      "color": "#3b82f6"
    }
  ],
  "data": [
    { "month": "2025-10-01", "admissions": 686 },
    { "month": "2025-11-01", "admissions": 556 },
    { "month": "2025-12-01", "admissions": 708 },
    { "month": "2026-01-01", "admissions": 1036 },
    { "month": "2026-02-01", "admissions": 424 },
    { "month": "2026-03-01", "admissions": 224 }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Admissions"
  }
}
```

### 2. ATA (Attendance to Admission) Analysis
The ATA percentage has seen a **drastic decline** as volume increased. In late 2025, branches like Moghbazar and Panthapath maintained healthy ATA levels (30-36%). However, in January 2026, despite record admissions, the ATA plummeted to single digits (approx. 7-9%) because the growth in attendance (driven by Olympiad) far outpaced the conversion to paid programs.

| Branch | Oct ''25 ATA | Jan ''26 ATA | Feb ''26 ATA |
| :--- | :---: | :---: | :---: |
| **Panthapath** | 36.94% | 6.89% | 8.15% |
| **Moghbazar** | 32.80% | 9.98% | 8.67% |
| **Uttara** | 16.67% | 7.21% | 10.51% |
| **Mirpur** | 16.91% | 6.64% | 3.40% |
| **Chawkbazar** | 12.36% | 8.78% | 8.44% |

```chart
{
  "type": "bar",
  "title": "Branch-wise ATA Comparison (Oct 2025)",
  "description": "Conversion efficiency (Attendance to Admission) during a steady-state month.",
  "xKey": "branch",
  "series": [
    {
      "key": "ATA_pct",
      "label": "ATA %",
      "color": "#10b981"
    }
  ],
  "data": [
    { "branch": "Chawkbazar", "ATA_pct": 12.36 },
    { "branch": "Mirpur", "ATA_pct": 16.91 },
    { "branch": "Moghbazar", "ATA_pct": 32.8 },
    { "branch": "Panthapath", "ATA_pct": 36.94 },
    { "branch": "Uttara", "ATA_pct": 16.67 }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Percentage (%)"
  }
}
```

### 3. Identified Issues
*   **Olympiad Lead Dilution:** In January 2026, the "English Olympiad" generated thousands of registrations and hundreds of attendees (e.g., 844 attendees in Mirpur), but **zero admissions** were attributed directly to that program in the leads API. This suggests Olympiad leads are high-volume but very difficult to convert into core programs like IELTS or Spoken English.
*   **Collection Gap:** In January 2026, **Uttara** and **Moghbazar** branches saw a massive gap between Booking Revenue and Collected Revenue.
    *   *Uttara (Jan ''26):* 5M BDT Booked vs 3.1M BDT Collected (**1.9M BDT Due**).
    *   *Moghbazar (Jan ''26):* 6.4M BDT Booked vs 4.5M BDT Collected (**1.9M BDT Due**).
*   **Mirpur Efficiency Drop:** Mirpur’s ATA dropped from 16.9% in October to a critical **3.4% in February**, despite having the second-highest attendance volume.

### 4. Scopes for Improvement
1.  **Lead Nurturing for Olympiad Participants:** Since thousands of students are visiting the branches for the Olympiad, the ADOs need a specific "Bridge Offer" to convert these attendees into *Spoken English Junior* or *Kids English* students.
2.  **Due Collection Drive:** ADOs at Uttara and Moghbazar should prioritize "Revenue (Collection)" over new bookings for the current month, as nearly 40% of January''s revenue remains in "Due" status.
3.  **Program Focus:** **IELTS** consistently maintains better ATA than general Spoken English. In February 2026, Uttara''s IELTS ATA was **18.39%**, while its general Spoken English was only **5.75%**. Marketing and ADOs should prioritize pushing IELTS to attendees to stabilize the ATA.

Let me know if you need a deeper look at any specific branch''s ADO performance or a breakdown of the installment collection status!',NULL,NULL,'2026-03-31 08:46:18.111836+00'),
('1e4337ce-178c-48b2-a960-2e6e7cd65002','04a12aa0-fa54-4af7-b65f-2df30dce7491','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','jan 1, 2026 - mar 30 enrollments in each branch',NULL,NULL,'2026-03-31 09:59:45.683304+00'),
('d85f37f0-4922-4279-840c-fc251af3ff2b','04a12aa0-fa54-4af7-b65f-2df30dce7491','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":{"output":"n/a","bigquery":true,"queries":1,"sql":"SELECT \n    branch, \n    COUNT(DISTINCT Mobile_Number) AS enrollments \nFROM `tenms-userdb.english_centre.offline_admissions_gsheet_v3` \nWHERE admission_date BETWEEN ''2026-01-01'' AND ''2026-03-30'' \nGROUP BY branch \nORDER BY enrollments DESC","sql_1":"","sql_2":""}}',NULL,NULL,'2026-03-31 10:00:10.22557+00'),
('ca84827f-4309-4f3d-bc12-3defbe190315','a0243dee-efae-4e69-96b3-e3f31d7eeaa2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','jan 1, 2026 - mar 30 enrollments in each branch',NULL,NULL,'2026-03-31 10:00:21.61159+00'),
('058bc18a-0431-4c60-88f8-1016ae9e7258','a0243dee-efae-4e69-96b3-e3f31d7eeaa2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam!

I have compiled the enrollment data for each branch for the period from January 1, 2026, to March 30, 2026. 

```chart
{
  "type": "bar",
  "title": "Branch-wise Enrollments",
  "description": "Total enrollments recorded for each English Centre branch between January 1, 2026, and March 30, 2026.",
  "xKey": "branch",
  "series": [
    {
      "key": "enrollments",
      "label": "Enrollments",
      "color": "#10b981"
    }
  ],
  "data": [
    {
      "branch": "Chawkbazar Branch",
      "enrollments": 242
    },
    {
      "branch": "Mirpur Branch",
      "enrollments": 343
    },
    {
      "branch": "Moghbazar Branch",
      "enrollments": 393
    },
    {
      "branch": "Panthapath Branch",
      "enrollments": 355
    },
    {
      "branch": "Uttara Branch",
      "enrollments": 340
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Number of Enrollments"
  }
}
```

| Branch | Enrollments |
| :--- | :--- |
| Moghbazar Branch | 393 |
| Panthapath Branch | 355 |
| Mirpur Branch | 343 |
| Uttara Branch | 340 |
| Chawkbazar Branch | 242 |

As seen in the data, **Moghbazar Branch** leads with the highest number of enrollments (393), while **Chawkbazar Branch** has the lowest (242) for this specific timeframe. Please let me know if you need a deeper dive into any specific program or further analysis.',NULL,NULL,'2026-03-31 10:00:39.842214+00'),
('946b375c-1ac2-4fd3-b398-df0b4c939265','04a12aa0-fa54-4af7-b65f-2df30dce7491','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','give me this data: conduct a due collection analysis. which branch has how much pending due and how much % is collected',NULL,NULL,'2026-03-31 10:09:08.368519+00'),
('a395a429-3da6-4498-94e8-5ea73b231b69','04a12aa0-fa54-4af7-b65f-2df30dce7491','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam! As you are overseeing the data operations for English Centres, I have conducted a due collection analysis based on the latest admission records.

Here is the branch-wise breakdown of pending dues and collection efficiency:

| Branch Name | Pending Due (BDT) | Collected Amount (BDT) | Collection % |
| :--- | :--- | :--- | :--- |
| Uttara Branch | 9,351,725.00 | 47,539,976.00 | 83.68% |
| Moghbazar Branch | 7,778,020.00 | 40,611,890.00 | 83.96% |
| Mirpur Branch | 6,412,580.00 | 38,446,100.00 | 85.78% |
| Chawkbazar Branch | 5,631,800.00 | 12,506,300.00 | 69.32% |
| Panthapath Branch | 5,557,638.00 | 42,504,637.00 | 88.51% |

```chart
{
  "type": "bar",
  "title": "Pending Due by Branch",
  "description": "Total pending due amount in BDT for each English Centre branch.",
  "xKey": "branch",
  "series": [
    {
      "key": "due",
      "label": "Pending Due (BDT)",
      "color": "#ef4444"
    }
  ],
  "data": [
    { "branch": "Uttara", "due": 9351725 },
    { "branch": "Moghbazar", "due": 7778020 },
    { "branch": "Mirpur", "due": 6412580 },
    { "branch": "Chawkbazar", "due": 5631800 },
    { "branch": "Panthapath", "due": 5557638 }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Amount (BDT)"
  }
}
```

```chart
{
  "type": "bar",
  "title": "Collection Percentage by Branch",
  "description": "Percentage of actual revenue that has been collected across branches.",
  "xKey": "branch",
  "series": [
    {
      "key": "pct",
      "label": "Collection %",
      "color": "#10b981"
    }
  ],
  "data": [
    { "branch": "Panthapath", "pct": 88.51 },
    { "branch": "Mirpur", "pct": 85.78 },
    { "branch": "Moghbazar", "pct": 83.96 },
    { "branch": "Uttara", "pct": 83.68 },
    { "branch": "Chawkbazar", "pct": 69.32 }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Percentage (%)"
  }
}
```

**Key Observations:**
*   **Highest Efficiency:** **Panthapath Branch** is leading with a collection rate of **88.51%**.
*   **Highest Pending Volume:** **Uttara Branch** has the highest volume of pending dues, totaling over **9.35 Million BDT**.
*   **Lowest Efficiency:** **Chawkbazar Branch** currently has the lowest collection percentage at **69.32%**, which might be expected given it is the newest branch.

Let me know if you need a deeper dive into any specific branch or programme!',NULL,NULL,'2026-03-31 10:09:38.709916+00'),
('63fa4bb0-b02f-4e96-9888-808c972f732f','67edf53e-b311-40d5-a55d-a69d28f78ca7','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam! Based on the performance data for 2026, the **Moghbazar Branch** is currently leading in terms of conversion efficiency.

While **Mirpur Branch** has the highest number of absolute admissions (78), **Moghbazar** stands out with the highest **Attendance to Admission (ATA)** rate at **9.54%**, meaning they are most effective at converting students who attend a free class into enrolled students.

Here is the detailed breakdown for all branches in 2026:

| Branch Name | Registrations | Attendance | Admissions | ATA (%) | Reg to Admission (%) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Moghbazar Branch** | 6,034 | 776 | 74 | **9.54%** | 1.23% |
| **Uttara Branch** | 13,711 | 885 | 73 | **8.25%** | 0.53% |
| **Panthapath Branch** | 6,490 | 935 | 73 | **7.81%** | 1.12% |
| **Chawkbazar Branch** | 9,941 | 918 | 69 | **7.52%** | 0.69% |
| **Mirpur Branch** | 10,972 | 1,326 | 78 | **5.88%** | 0.71% |

```chart
{
  "type": "bar",
  "title": "Branch-wise Attendance to Admission (ATA%) - 2026",
  "description": "Comparison of conversion efficiency (ATA%) across different branches for the year 2026.",
  "xKey": "branch",
  "series": [
    {
      "key": "ata_pct",
      "label": "ATA (%)",
      "color": "#10b981"
    }
  ],
  "data": [
    {
      "branch": "Moghbazar",
      "ata_pct": 9.54
    },
    {
      "branch": "Uttara",
      "ata_pct": 8.25
    },
    {
      "branch": "Panthapath",
      "ata_pct": 7.81
    },
    {
      "branch": "Chawkbazar",
      "ata_pct": 7.52
    },
    {
      "branch": "Mirpur",
      "ata_pct": 5.88
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "ATA Percentage"
  }
}
```

Although Moghbazar has the best conversion rate, **Uttara** and **Mirpur** are driving much higher volumes of registrations. Mirpur, in particular, has the highest attendance count (1,326), but their lower ATA (5.88%) suggests there is significant room for the Admission Officers there to improve their conversion process.',NULL,NULL,'2026-04-02 06:14:08.61376+00'),
('a33f6ef0-3622-4b52-845f-f0ecb0e01177','3e2433c0-8aa1-4aec-9123-e478fa031418','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Show admissions by Humayra Kabir Shatabdi this month',NULL,NULL,'2026-04-02 07:47:07.78156+00'),
('ba5420ed-8043-4fd5-8f78-0c3b5e70ab97','3e2433c0-8aa1-4aec-9123-e478fa031418','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam!

Humayra Kabir Shatabdi, who is an Admission Officer (ADO) at our **Mirpur branch**, has recorded **2 admissions** so far this month.

| Name | Role | Branch | Admissions (This Month) |
| :--- | :--- | :--- | :--- |
| Humayra Kabir Shatabdi | ADO | Mirpur | 2 |

If you need a breakdown of these admissions by program or want to see how this compares to other ADOs at the Mirpur branch, just let me know!',NULL,NULL,'2026-04-02 07:47:20.686877+00'),
('0176b5b7-9eb8-4635-a3c5-f795e49fd8ee','63ed18f9-8565-48d9-9407-e9ec59c363b8','6be9ac3f-4320-41ce-a71a-f097b163feb6','user','hello',NULL,NULL,'2026-04-02 07:56:06.34032+00'),
('0068d388-67e1-45b7-9303-7a9c5de44c16','63ed18f9-8565-48d9-9407-e9ec59c363b8','6be9ac3f-4320-41ce-a71a-f097b163feb6','assistant','Hello Uttam. How may I help?',NULL,NULL,'2026-04-02 07:56:12.073191+00'),
('2baaa706-cd61-47ba-9b3b-912cb9399a51','85360d6f-2f4b-4a03-b675-e159d8e20552','6be9ac3f-4320-41ce-a71a-f097b163feb6','user','hiu',NULL,NULL,'2026-04-02 07:59:17.902156+00'),
('b2e2aca4-2a25-4c6b-99f5-510ec73dbecc','85360d6f-2f4b-4a03-b675-e159d8e20552','6be9ac3f-4320-41ce-a71a-f097b163feb6','assistant','Hello Uttam. How may I help?',NULL,NULL,'2026-04-02 07:59:23.442925+00'),
('f1132f42-ae6c-4696-aec5-2c01c4cc333d','7f9d4151-6aab-464e-8835-f7704ee722ee','6be9ac3f-4320-41ce-a71a-f097b163feb6','user','who am i/',NULL,NULL,'2026-04-02 07:59:28.300612+00'),
('48e8c69f-47f1-44a8-a8fb-b7a8a3203bf9','7f9d4151-6aab-464e-8835-f7704ee722ee','6be9ac3f-4320-41ce-a71a-f097b163feb6','assistant','Hello Uttam. You are Uttam Deb from the Data & AI team, working as the Business Intelligence stakeholder for English Centre data operations. You are also the developer of EC Data Agent. You support EC data through G99 dashboards, Metabase, ClassroomOS analytics, and the automated free class booking sheet.',NULL,NULL,'2026-04-02 07:59:35.77899+00'),
('1665cb26-59e8-4297-a928-031eccac3d84','7ac9d774-5e95-4c82-adee-60d1b11d07d9','6be9ac3f-4320-41ce-a71a-f097b163feb6','user','Show admissions by Nomit Akone Lamim this month',NULL,NULL,'2026-04-02 08:00:10.453718+00'),
('e13d78fb-6966-4ab9-899e-940e439bea43','7ac9d774-5e95-4c82-adee-60d1b11d07d9','6be9ac3f-4320-41ce-a71a-f097b163feb6','assistant','Hello Uttam! 

Nomit Akone Lamim, who serves as an Admission Officer (ADO) at our **Moghbazar Branch**, does not have any admissions recorded for the current month so far.

If you would like to check the performance for a different date range or for another team member, feel free to ask!',NULL,NULL,'2026-04-02 08:00:23.447967+00'),
('8da31030-9e31-4030-9ca1-1be6f1b56866','6d1a3160-d4a9-4d47-9c34-1147ca250c85','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hi',NULL,NULL,'2026-04-02 08:11:35.878986+00'),
('ea68d732-aa21-414d-a8cc-cd8b4fbde01b','6d1a3160-d4a9-4d47-9c34-1147ca250c85','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam. How can I help with EC data today?',NULL,NULL,'2026-04-02 08:11:41.88121+00'),
('8becdadb-5e2a-4ca5-ad23-642cde777756','9fdbdcf3-e7f7-4b58-83c9-c54eab3de3c2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hi',NULL,NULL,'2026-04-02 08:45:19.936209+00'),
('964fcdab-b149-4e23-a052-6dd902e66ca6','9fdbdcf3-e7f7-4b58-83c9-c54eab3de3c2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam. How may I help?',NULL,NULL,'2026-04-02 08:45:26.021261+00'),
('a80299b0-f97a-4415-aa1e-b78599020e9c','8ec0d374-00bb-425c-bd22-21d0a0acf02c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Which source gives the worst RTA?',NULL,NULL,'2026-04-02 10:58:02.85887+00'),
('55736bc2-2dec-46d3-a3fa-3ef9843cec72','d32d0d0d-0248-43be-a830-ef8b593d97de','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Which source gives the worst RTA?',NULL,NULL,'2026-04-02 10:58:29.865404+00'),
('bf02fc23-4e57-4ed1-81f6-baf4ba558124','d32d0d0d-0248-43be-a830-ef8b593d97de','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam,

Based on the historical data, the **Tally Form** has the lowest Registration to Attendance (RTA) rate at **5.38%**. 

However, looking at the major data sources, **Facebook Form** also shows a very low RTA of **6.15%**, despite contributing the highest volume of registrations. In contrast, **ClassroomOS** performs the best with an RTA of **37.98%**, likely due to it being an internal tool used directly at the branches.

Here is the detailed performance breakdown by data source:

| Data Source | Registrations | Attendance | RTA (%) |
| :--- | :--- | :--- | :--- |
| Tally Form | 372 | 20 | 5.38% |
| Facebook Form | 158,068 | 9,728 | 6.15% |
| Booking System | 42,021 | 2,677 | 6.37% |
| Google Form | 64,667 | 4,460 | 6.90% |
| iHelp | 781 | 85 | 10.88% |
| Micro Survey | 2,640 | 437 | 16.55% |
| ClassroomOS | 7,407 | 2,813 | 37.98% |

```chart
{
  "type": "bar",
  "title": "RTA % by Data Source",
  "description": "Comparison of Registration to Attendance (RTA) percentage across different lead sources.",
  "xKey": "data_source",
  "series": [
    {
      "key": "rta_pct",
      "label": "RTA (%)",
      "color": "#ef4444"
    }
  ],
  "data": [
    { "data_source": "Tally Form", "rta_pct": 5.38 },
    { "data_source": "Facebook Form", "rta_pct": 6.15 },
    { "data_source": "Booking System", "rta_pct": 6.37 },
    { "data_source": "Google Form", "rta_pct": 6.9 },
    { "data_source": "iHelp", "rta_pct": 10.88 },
    { "data_source": "Micro Survey", "rta_pct": 16.55 },
    { "data_source": "ClassroomOS", "rta_pct": 37.98 }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "RTA %"
  }
}
```

The chart highlights the significant gap between automated/external leads (like Facebook and Tally forms) and internal management leads (ClassroomOS). If you need a deeper dive into a specific branch or time period, let me know!',NULL,NULL,'2026-04-02 10:58:52.676104+00'),
('5408eaa4-d897-4b7f-aa89-b1d208b81ee4','598e4983-a20a-42ba-aab3-2706fca96aa3','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Top 5 ADOs by admissions',NULL,NULL,'2026-04-04 06:39:23.900782+00'),
('a70ab60d-2a23-4a9b-bc22-4fcd93a2ab43','598e4983-a20a-42ba-aab3-2706fca96aa3','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam!

Here are the top 5 Admission Officers (ADOs) across all English Centres, ranked by their total number of admissions.

| ADO Name | Branch | Admissions |
| :--- | :--- | :--- |
| Maliha Monowara Meem | Panthapath | 1,296 |
| Aysha Siddiqua Mim | Uttara | 1,077 |
| Hasna Hana Eva | Uttara | 998 |
| Jogodish Ghosh | Mirpur | 971 |
| Al Amin | Panthapath | 964 |

```chart
{
  "type": "bar",
  "title": "Top 5 ADOs by Admissions",
  "description": "Total unique admissions handled by the top 5 performing Admission Officers.",
  "xKey": "name",
  "series": [
    {
      "key": "admissions",
      "label": "Admissions",
      "color": "#10b981"
    }
  ],
  "data": [
    {
      "name": "Maliha Monowara Meem",
      "admissions": 1296
    },
    {
      "name": "Aysha Siddiqua Mim",
      "admissions": 1077
    },
    {
      "name": "Hasna Hana Eva",
      "admissions": 998
    },
    {
      "name": "Jogodish Ghosh",
      "admissions": 971
    },
    {
      "name": "Al Amin",
      "admissions": 964
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Admissions"
  }
}
```

Maliha Monowara Meem from the Panthapath branch currently leads with the highest number of admissions, followed by Aysha Siddiqua Mim from Uttara. This data reflects all-time unique admissions recorded in the system.',NULL,NULL,'2026-04-04 06:39:46.047521+00')
ON CONFLICT (id) DO NOTHING;