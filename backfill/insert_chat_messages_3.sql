INSERT INTO public.chat_messages (id,session_id,user_id,role,content,feedback,feedback_note,created_at) VALUES
('9dfd10cf-b02d-4182-91fa-7aeadf7b58e5','2ef2e30b-ce54-4810-a4b1-fd23a0625b78','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','show me branch wise regs for today',NULL,NULL,'2026-03-18 08:13:52.073648+00'),
('57a15130-a31e-44eb-9b5f-b3306ab9f6e3','2ef2e30b-ce54-4810-a4b1-fd23a0625b78','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam bhai — branch-wise registrations for today:

| Branch | Registrations |
|---|---:|
| Chawkbazar Branch | 19 |
| Mirpur Branch | 20 |
| Moghbazar Branch | 11 |
| Panthapath Branch | 11 |
| Uttara Branch | 20 |

**Total regs today: 81**

If you want, I can also show:
- branch-wise **attendance/admissions for today**
- **source-wise regs**
- **programme-wise regs by branch**',NULL,NULL,'2026-03-18 08:14:04.123934+00'),
('349ed576-2c77-4979-94db-6ca029073fb9','abd5bd97-7387-4660-9ca4-178eba99de9d','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','show me branch wise regs for today in a pie chart',NULL,NULL,'2026-03-18 09:21:24.767409+00'),
('0a422d4c-d83b-4672-b868-9a61c60fc7c2','abd5bd97-7387-4660-9ca4-178eba99de9d','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":"Hello Uttam Deb\n\nHere is today’s branch-wise registrations in a pie chart.\n\n```chart\n{\n  \"type\": \"pie\",\n  \"title\": \"Branch-wise registrations today\",\n  \"description\": \"Share of distinct free class registrations by branch for today. Date filter applied: today in Asia/Dhaka timezone.\",\n  \"labelKey\": \"branch\",\n  \"valueKey\": \"registrations\",\n  \"data\": [\n    {\n      \"branch\": \"Mirpur Branch\",\n      \"registrations\": 24,\n      \"color\": \"#3b82f6\"\n    },\n    {\n      \"branch\": \"Chawkbazar Branch\",\n      \"registrations\": 22,\n      \"color\": \"#f59e0b\"\n    },\n    {\n      \"branch\": \"Uttara Branch\",\n      \"registrations\": 22,\n      \"color\": \"#10b981\"\n    },\n    {\n      \"branch\": \"Panthapath Branch\",\n      \"registrations\": 13,\n      \"color\": \"#8b5cf6\"\n    },\n    {\n      \"branch\": \"Moghbazar Branch\",\n      \"registrations\": 12,\n      \"color\": \"#ef4444\"\n    }\n  ],\n  \"options\": {\n    \"showLegend\": true,\n    \"showTooltip\": true,\n    \"showLabels\": true,\n    \"valueLabel\": \"Registrations\"\n  }\n}\n```\n\n| Branch | Registrations |\n|---|---:|\n| Mirpur Branch | 24 |\n| Chawkbazar Branch | 22 |\n| Uttara Branch | 22 |\n| Panthapath Branch | 13 |\n| Moghbazar Branch | 12 |\n\nTotal registrations today: 93"}',NULL,NULL,'2026-03-18 09:21:48.622508+00'),
('61c0ce66-6ea7-42d8-bca9-74729409e559','81ecc8b5-f88d-43aa-b7c1-6f325397dd6c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','show me branch wise regs for today in a pie chart',NULL,NULL,'2026-03-18 09:24:31.420809+00'),
('15099aa4-0305-4e96-b5c8-ef36257d3a67','5e2afd49-191c-490d-8aa2-fe3a12e150b2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','show me branch-wise RTA performance since Jan 2026',NULL,NULL,'2026-03-21 19:52:44.226825+00'),
('a4a29728-e62d-48a0-8c88-18e525c05c70','81ecc8b5-f88d-43aa-b7c1-6f325397dd6c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb

```chart
{
  "type": "pie",
  "title": "Branch-wise registrations today",
  "description": "Free class registrations by branch for today, based on submission date = today.",
  "labelKey": "branch",
  "valueKey": "registrations",
  "data": [
    {
      "branch": "Mirpur Branch",
      "registrations": 24,
      "color": "#3b82f6"
    },
    {
      "branch": "Chawkbazar Branch",
      "registrations": 22,
      "color": "#f59e0b"
    },
    {
      "branch": "Uttara Branch",
      "registrations": 22,
      "color": "#10b981"
    },
    {
      "branch": "Panthapath Branch",
      "registrations": 13,
      "color": "#ef4444"
    },
    {
      "branch": "Moghbazar Branch",
      "registrations": 12,
      "color": "#8b5cf6"
    }
  ],
  "options": {
    "showLegend": true,
    "showTooltip": true,
    "showLabels": true,
    "valueLabel": "Registrations"
  }
}
```

Here is today’s branch-wise registrations summary.

| Branch | Registrations |
|---|---:|
| Mirpur Branch | 24 |
| Chawkbazar Branch | 22 |
| Uttara Branch | 22 |
| Panthapath Branch | 13 |
| Moghbazar Branch | 12 |

**Total registrations today:** 93

Mirpur Branch is leading today with 24 registrations. Chawkbazar Branch and Uttara Branch are tied in second place with 22 each.',NULL,NULL,'2026-03-18 09:24:52.396946+00'),
('8fc2007e-57f8-4bb6-8653-8433487c8d9b','cb6b2141-8adf-41bd-b3ce-5dee9fe445bb','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','show me branch wise regs for today in a pie chart',NULL,NULL,'2026-03-18 09:38:59.081766+00'),
('cbe96a54-350f-4e4b-a385-a809b70a3e6c','cb6b2141-8adf-41bd-b3ce-5dee9fe445bb','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb

```chart
{
  "type": "pie",
  "title": "Branch-wise registrations today",
  "description": "Share of registrations by branch for today based on distinct contact count from offline leads data. Date filter applied: today.",
  "labelKey": "branch",
  "valueKey": "registrations",
  "data": [
    {
      "branch": "Mirpur Branch",
      "registrations": 24,
      "color": "#3b82f6"
    },
    {
      "branch": "Chawkbazar Branch",
      "registrations": 22,
      "color": "#f59e0b"
    },
    {
      "branch": "Uttara Branch",
      "registrations": 22,
      "color": "#10b981"
    },
    {
      "branch": "Panthapath Branch",
      "registrations": 13,
      "color": "#ef4444"
    },
    {
      "branch": "Moghbazar Branch",
      "registrations": 12,
      "color": "#8b5cf6"
    }
  ],
  "options": {
    "showLegend": true,
    "showTooltip": true,
    "showLabels": true,
    "valueLabel": "Registrations"
  }
}
```

Here is today’s branch-wise registrations in pie chart format.

| Branch | Registrations |
|---|---:|
| Mirpur Branch | 24 |
| Chawkbazar Branch | 22 |
| Uttara Branch | 22 |
| Panthapath Branch | 13 |
| Moghbazar Branch | 12 |

Total registrations today: **93**

Top branch today: **Mirpur Branch** with **24** registrations.',NULL,NULL,'2026-03-18 09:39:19.879852+00'),
('4cc1dd51-078a-4de3-831d-3ea965422900','79560733-df33-4e75-9484-7740202b6112','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','show me branch wise regs for today in a pie char',NULL,NULL,'2026-03-18 09:58:28.049324+00'),
('e7d95af9-50ff-4f13-b6c4-61702f3c1271','79560733-df33-4e75-9484-7740202b6112','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb

```chart
{
  "type": "pie",
  "title": "Branch-wise registrations today",
  "description": "Free class registrations by branch for today across all English Centres.",
  "labelKey": "branch",
  "valueKey": "regs",
  "data": [
    {
      "branch": "Mirpur Branch",
      "regs": 24,
      "color": "#3b82f6"
    },
    {
      "branch": "Chawkbazar Branch",
      "regs": 22,
      "color": "#f59e0b"
    },
    {
      "branch": "Uttara Branch",
      "regs": 22,
      "color": "#10b981"
    },
    {
      "branch": "Panthapath Branch",
      "regs": 13,
      "color": "#ef4444"
    },
    {
      "branch": "Moghbazar Branch",
      "regs": 12,
      "color": "#8b5cf6"
    }
  ],
  "options": {
    "showLegend": true,
    "showTooltip": true,
    "showLabels": true,
    "valueLabel": "Registrations"
  }
}
```

Today’s branch-wise registrations are below:

| Branch | Registrations |
|---|---:|
| Mirpur Branch | 24 |
| Chawkbazar Branch | 22 |
| Uttara Branch | 22 |
| Panthapath Branch | 13 |
| Moghbazar Branch | 12 |

Total registrations today: **93**

Mirpur is leading today with **24 regs**, while **Chawkbazar** and **Uttara** are tied at **22** each.',NULL,NULL,'2026-03-18 09:58:50.539636+00'),
('8da090a7-07e4-45db-a063-8658ef09ee19','7ddf0137-1c2e-4b4b-8a08-3a05647f6fd1','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','show me branch wise regs for today in a pie chart',NULL,NULL,'2026-03-18 10:00:09.625048+00'),
('fbeb40b8-13fe-4964-8202-43aaca8cce05','7ddf0137-1c2e-4b4b-8a08-3a05647f6fd1','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, here is the branch-wise registrations for today in a pie chart.

```chart
{
  "type": "pie",
  "title": "Branch-wise registrations today",
  "description": "Today’s free class registrations by branch. Filter applied: submission date = today.",
  "labelKey": "branch",
  "valueKey": "registrations",
  "data": [
    {
      "branch": "Mirpur Branch",
      "registrations": 24,
      "color": "#3b82f6"
    },
    {
      "branch": "Chawkbazar Branch",
      "registrations": 22,
      "color": "#10b981"
    },
    {
      "branch": "Uttara Branch",
      "registrations": 22,
      "color": "#f59e0b"
    },
    {
      "branch": "Panthapath Branch",
      "registrations": 13,
      "color": "#ef4444"
    },
    {
      "branch": "Moghbazar Branch",
      "registrations": 12,
      "color": "#8b5cf6"
    }
  ],
  "options": {
    "showLegend": true,
    "showTooltip": true,
    "showLabels": true,
    "valueLabel": "Registrations"
  }
}
```

| Branch | Registrations |
|---|---:|
| Mirpur Branch | 24 |
| Chawkbazar Branch | 22 |
| Uttara Branch | 22 |
| Panthapath Branch | 13 |
| Moghbazar Branch | 12 |

Total registrations today: **93**

Top branch today: **Mirpur Branch** with **24** registrations.',NULL,NULL,'2026-03-18 10:00:30.631154+00'),
('55c6c6ef-50dd-4e33-bd6e-9eec53585ecb','7da84bbb-989e-43f9-b95f-4e446dcc889b','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','show me branch wise regs for today in a line chart',NULL,NULL,'2026-03-18 10:10:25.808484+00'),
('85c359a6-edf2-444f-a727-1605fa236233','7da84bbb-989e-43f9-b95f-4e446dcc889b','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, here are today’s branch-wise registrations.

| Branch | Registrations |
|---|---:|
| Chawkbazar Branch | 22 |
| Mirpur Branch | 24 |
| Moghbazar Branch | 12 |
| Panthapath Branch | 13 |
| Uttara Branch | 22 |

```chart
{
  "type": "line",
  "title": "Branch-wise registrations today",
  "description": "Distinct free class registrations by branch for today (2026-03-18). No additional filters applied.",
  "xKey": "branch",
  "series": [
    {
      "key": "registrations",
      "label": "Registrations",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "branch": "Chawkbazar Branch",
      "registrations": 22
    },
    {
      "branch": "Mirpur Branch",
      "registrations": 24
    },
    {
      "branch": "Moghbazar Branch",
      "registrations": 12
    },
    {
      "branch": "Panthapath Branch",
      "registrations": 13
    },
    {
      "branch": "Uttara Branch",
      "registrations": 22
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Registrations"
  }
}
```

Quick read:
- Highest: Mirpur Branch with 24 regs
- Lowest: Moghbazar Branch with 12 regs
- Chawkbazar and Uttara are tied at 22

If you want, I can also show this in a bar chart, which is usually better for branch-wise comparison.',NULL,NULL,'2026-03-18 10:10:58.280649+00'),
('17df1b98-da21-4e9b-8d83-5ebfe8d9e8c7','e40c98f0-479c-427f-8da7-2a087603ee3e','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','show me branch wise regs for today in a bar chart',NULL,NULL,'2026-03-18 10:20:20.88169+00'),
('3cba8607-06cd-4762-ab5d-399f01f9cb5a','e40c98f0-479c-427f-8da7-2a087603ee3e','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, here are today’s branch-wise free class registrations.

| Branch | Registrations |
|---|---:|
| Mirpur Branch | 24 |
| Uttara Branch | 22 |
| Chawkbazar Branch | 22 |
| Panthapath Branch | 13 |
| Moghbazar Branch | 12 |

```chart
{
  "type": "bar",
  "title": "Branch-wise registrations today",
  "description": "Free class registrations by branch for today. Date filter applied: today only.",
  "xKey": "branch",
  "series": [
    {
      "key": "registrations",
      "label": "Registrations",
      "color": "#f59e0b"
    }
  ],
  "data": [
    {
      "branch": "Mirpur Branch",
      "registrations": 24
    },
    {
      "branch": "Uttara Branch",
      "registrations": 22
    },
    {
      "branch": "Chawkbazar Branch",
      "registrations": 22
    },
    {
      "branch": "Panthapath Branch",
      "registrations": 13
    },
    {
      "branch": "Moghbazar Branch",
      "registrations": 12
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Registrations"
  }
}
```

Top branch today is **Mirpur Branch** with **24** registrations.  
**Uttara Branch** and **Chawkbazar Branch** are tied at **22** each.',NULL,NULL,'2026-03-18 10:20:40.114653+00'),
('f20c1871-ac2d-43b8-b3da-620fb445b28f','a932d426-2711-457b-b1a4-f7ca03deaae2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hi',NULL,NULL,'2026-03-18 10:21:08.592842+00'),
('7f044326-603e-4134-baa3-4f4807b3e2a2','a932d426-2711-457b-b1a4-f7ca03deaae2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb. How may I help with English Centre data today?',NULL,NULL,'2026-03-18 10:21:13.892406+00'),
('5a8e7af9-47a5-4bd5-9363-65d26e213d17','a9078c61-9855-4f6f-b86a-b5aaad554dff','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hello',NULL,NULL,'2026-03-18 10:57:30.543072+00'),
('b0fdb1cc-40bf-4f8a-bdf4-dcae1424169e','a9078c61-9855-4f6f-b86a-b5aaad554dff','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb. How may I help with EC data today?',NULL,NULL,'2026-03-18 10:57:38.190291+00'),
('9babb227-22d1-491b-9eb5-616776ab2fde','a9078c61-9855-4f6f-b86a-b5aaad554dff','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','thanks',NULL,NULL,'2026-03-18 10:57:41.825496+00'),
('9babcde5-efc7-468b-a20c-117ee245e4ba','a9078c61-9855-4f6f-b86a-b5aaad554dff','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, BI.
You’re welcome. How may I help with EC data?',NULL,NULL,'2026-03-18 10:57:52.153247+00'),
('9e185f93-3594-45eb-b97d-06ed695af01a','30030ea7-3226-4695-8393-da028acb6d62','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hello there',NULL,NULL,'2026-03-18 11:04:46.065536+00'),
('e99028ce-d233-424f-8f82-b6564048f09e','30030ea7-3226-4695-8393-da028acb6d62','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb. How may I help with EC data today?',NULL,NULL,'2026-03-18 11:04:52.148066+00'),
('06e26eed-9649-46de-8764-f532b8a72a69','df4b52b8-0553-40d9-a5f5-1b24313cdcf9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Show today''s admissions by branch',NULL,NULL,'2026-03-18 11:21:05.946131+00'),
('19447599-97ed-4e37-8058-e180d1365a6a','df4b52b8-0553-40d9-a5f5-1b24313cdcf9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, BI stakeholder.

There are **no admissions recorded today** in the query result for branch-wise admissions.

**Applied filter:** admission date = today  
**Metric:** distinct admitted phone numbers by branch

Since the result came back empty, there is nothing to show in the branch breakdown table for today.

If you want, I can also help with any of these next:
- **Yesterday’s admissions by branch**
- **Last 7 days admissions trend**
- **Today’s admissions with revenue by branch**
- **MTD admissions by branch**',NULL,NULL,'2026-03-18 11:21:23.395695+00'),
('32a1be39-52a1-47b8-83a5-968f9ab636ad','df4b52b8-0553-40d9-a5f5-1b24313cdcf9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Give me a pie chat of distributions of leads this year by data source',NULL,NULL,'2026-03-18 11:21:47.555383+00'),
('c9783c8d-c216-4e15-9318-97d3cce0e597','df4b52b8-0553-40d9-a5f5-1b24313cdcf9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, BI stakeholder.

Here is the distribution of leads this year by data source.  
Applied filter: **Year-to-date**, from **January 1 of this year to today**.

| Data Source | Leads | Share |
|---|---:|---:|
| Facebook Form | 22,631 | 47.6% |
| Booking System | 13,501 | 28.4% |
| ClassroomOS | 6,490 | 13.6% |
| Internal Platform | 4,897 | 10.3% |
| iHelp | 130 | 0.3% |
| Google Form | 34 | 0.1% |

```chart
{
  "type": "pie",
  "title": "Lead distribution by data source",
  "description": "Share of distinct leads by data source for this year to date, from January 1 to today.",
  "labelKey": "data_source",
  "valueKey": "leads",
  "data": [
    {
      "data_source": "Facebook Form",
      "leads": 22631,
      "color": "#3b82f6"
    },
    {
      "data_source": "Booking System",
      "leads": 13501,
      "color": "#f59e0b"
    },
    {
      "data_source": "ClassroomOS",
      "leads": 6490,
      "color": "#10b981"
    },
    {
      "data_source": "Internal Platform",
      "leads": 4897,
      "color": "#8b5cf6"
    },
    {
      "data_source": "iHelp",
      "leads": 130,
      "color": "#ef4444"
    },
    {
      "data_source": "Google Form",
      "leads": 34,
      "color": "#6b7280"
    }
  ],
  "options": {
    "showLegend": true,
    "showTooltip": true,
    "showLabels": true,
    "valueLabel": "Leads"
  }
}
```

Quick read:
- **Facebook Form** is contributing nearly **half of all leads**.
- **Booking System** is the second largest source at **28.4%**.
- **ClassroomOS + Internal Platform** together contribute **23.9%**.
- Minor sources like **iHelp** and **Google Form** are negligible this year.

If you want, I can also give this as:
- **branch-wise split by data source**
- **monthly trend by data source**
- **top lead sources vs data sources together**',NULL,NULL,'2026-03-18 11:22:14.786561+00'),
('e639049f-f660-45f9-89ca-fd0b034c5e98','bf277795-75dc-413c-88b3-4d82c9a9b421','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Show this week''s tele-eligible leads',NULL,NULL,'2026-03-18 11:52:06.893832+00'),
('dd222472-8a15-47e1-9f64-2b9088aa127d','b2473f4c-befb-4447-bbc9-813e8d010621','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb (BI),

This dashboard snapshot is **not validated** against the SQL that was run. The image and SQL output do **not match**.

## Mismatch found

| Branch | Dashboard Attendance | SQL Attendance | Match? | Dashboard Admissions | SQL Admissions | Match? | Dashboard ATA | SQL ATA | Match? |
|---|---:|---:|---|---:|---:|---|---:|---:|---|
| Uttara Branch | 209 | 201 | No | 40 | 88 | No | 19% | 43.78% | No |
| Panthapath Branch | 212 | 197 | No | 32 | 109 | No | 15% | 55.33% | No |
| Mirpur Branch | 275 | 250 | No | 17 | 36 | No | 6% | 14.40% | No |
| Moghbazar Branch | 147 | 144 | No | 37 | 71 | No | 25% | 49.31% | No |
| Chawkbazar Branch | 234 | 234 | Yes | 25 | 63 | No | 11% | 26.92% | No |
| Grand total | 1,077 | 1,026 | No | 151 | 367 | No | 15% | 35.77% | No |

## Conclusion

The dashboard is **not using the same logic** as the SQL that was executed.

Most likely reasons:
- Dashboard admissions are probably counting **converted free class attendees only**, not all admissions in the last 30 days.
- SQL admissions used `offline_admissions_gsheet_v3` by `admission_date`, which includes a broader admission population.
- Dashboard attendance may be coming from a different attendance source or slightly different filtering logic.
- The dashboard likely applies a stricter ATA definition than the SQL.

## What looks likely

Based on the pattern, the dashboard numbers look more like:
- **Attendance:** free class attendees in last 30 days
- **Admissions:** only those admissions attributable to free class conversion
- **ATA:** converted admissions / attendance

That means the SQL you ran is **not the correct validation SQL** for this card.

## Validation verdict

**Result: Not validated.**

If you want, the next correct step is to validate this card using `offline_leads_api` only, where attendance and admission are already linked on contact + programme logic. That would be the right query base for this exact dashboard-style ATA check.',NULL,NULL,'2026-03-18 13:10:31.587988+00'),
('81cd94ec-c5a9-40de-88ba-12d4d6aa49ce','cfb6657f-7d9e-4df1-96d5-70c2b56ed8bf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb — as BI stakeholder, here is the **month-wise revenue collected amount since Jan 2026**.

| Month | Revenue Collected Amount (BDT) |
|---|---:|
| 2026-01 | 17,456,000 |
| 2026-02 | 7,199,800 |
| 2026-03 | 2,641,970 |

```chart
{
  "type": "line",
  "title": "Month-wise Revenue Collected Amount since Jan 2026",
  "description": "Collected revenue amount by month from 2026-01-01 onward, based on transaction date.",
  "xKey": "month",
  "series": [
    {
      "key": "revenue_collected_amount",
      "label": "Collected Amount",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "month": "2026-01",
      "revenue_collected_amount": 17456000
    },
    {
      "month": "2026-02",
      "revenue_collected_amount": 7199800
    },
    {
      "month": "2026-03",
      "revenue_collected_amount": 2641970
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Collected Amount (BDT)"
  }
}
```

**Quick read:**
- **January 2026** had the highest collection: **BDT 17.46M**
- **February 2026** dropped to **BDT 7.20M**
- **March 2026** so far stands at **BDT 2.64M**

If you want, I can also break this down:
- **branch-wise by month**
- **programme-wise by month**
- **collection vs booking by month**',NULL,NULL,'2026-03-20 08:33:33.097781+00'),
('d4375c68-cbc7-4040-8356-b5e128ed9e32','bf277795-75dc-413c-88b3-4d82c9a9b421','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, BI stakeholder.

Here are this week’s tele-eligible leads so far.

**Date range applied:** 16 Mar 2026 to 18 Mar 2026  
**Definition used by the query:** distinct contacts from the tele sheet source, excluding lead sources **IELTS Mock Test** and **Study Abroad**

| Submission Date | Tele-eligible Leads |
|---|---:|
| 2026-03-16 | 296 |
| 2026-03-17 | 305 |
| 2026-03-18 | 91 |

**Total this week so far:** **692**

```chart
{
  "type": "line",
  "title": "This Week''s Tele-eligible Leads",
  "description": "Daily tele-eligible leads from 2026-03-16 to 2026-03-18. Counted as distinct contacts and excluding lead sources IELTS Mock Test and Study Abroad.",
  "xKey": "submission_date",
  "series": [
    {
      "key": "tele_eligible_leads",
      "label": "Tele-eligible Leads",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "submission_date": "2026-03-16",
      "tele_eligible_leads": 296
    },
    {
      "submission_date": "2026-03-17",
      "tele_eligible_leads": 305
    },
    {
      "submission_date": "2026-03-18",
      "tele_eligible_leads": 91
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Leads"
  }
}
```

If you want, I can also break this down by **branch**, **programme**, or **lead source** for this week.','like',NULL,'2026-03-18 11:52:30.268205+00'),
('4517ac8e-2a54-407d-b917-33f40d0c0c5f','9c827daa-70bd-4a76-aa31-abd5575676c9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Which branch has best RTA?',NULL,NULL,'2026-03-18 11:53:52.88544+00'),
('c417a9b1-830e-4cd7-942d-6830a4dbbe69','9c827daa-70bd-4a76-aa31-abd5575676c9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam da,

Based on the query result, **Moghbazar Branch has the best RTA**.

| Rank | Branch | Attendance | Registrations | RTA |
|---|---|---:|---:|---:|
| 1 | Moghbazar Branch | 3,479 | 29,149 | **11.94%** |
| 2 | Panthapath Branch | 3,493 | 38,979 | 8.96% |
| 3 | Mirpur Branch | 5,009 | 66,728 | 7.51% |
| 4 | Chawkbazar Branch | 2,489 | 39,144 | 6.36% |
| 5 | Uttara Branch | 3,598 | 88,861 | 4.05% |

```chart
{
  "type": "bar",
  "title": "Branch-wise RTA Comparison",
  "description": "Registration to Attendance percentage by branch across all available data in the query result. Excludes null branch and test/dummy branch values.",
  "xKey": "branch",
  "series": [
    {
      "key": "rta_percentage",
      "label": "RTA %",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "branch": "Moghbazar Branch",
      "rta_percentage": 11.94
    },
    {
      "branch": "Panthapath Branch",
      "rta_percentage": 8.96
    },
    {
      "branch": "Mirpur Branch",
      "rta_percentage": 7.51
    },
    {
      "branch": "Chawkbazar Branch",
      "rta_percentage": 6.36
    },
    {
      "branch": "Uttara Branch",
      "rta_percentage": 4.05
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "RTA %"
  }
}
```

A quick note: the result also contains a **null branch** row and **dummy test lead rows**, so those should not be considered in branch performance comparison.

If you want, I can also give you:
- **best RTA for last 7/30 days**
- **programme-wise RTA by branch**
- **cleaned SQL excluding null/test data**',NULL,NULL,'2026-03-18 11:54:20.524946+00'),
('934a95d6-68d8-4f52-81ed-7f235c54071a','9c827daa-70bd-4a76-aa31-abd5575676c9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Who is Raied?',NULL,NULL,'2026-03-18 12:03:37.85129+00'),
('981667b8-1747-4f3c-94e7-efd140568506','9c827daa-70bd-4a76-aa31-abd5575676c9','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb. Raied refers to Abdullah Abyad Raied, the CTO of 10MS Limited and 10MS Learning Centre.',NULL,NULL,'2026-03-18 12:03:49.18026+00'),
('3ac26b3a-3484-4deb-a3c0-82b8b806bcd3','e92d0214-b3c4-4902-9dca-e22c19f01e4b','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','is this data right?',NULL,NULL,'2026-03-18 12:55:51.539258+00'),
('746c0bc1-f4ce-437b-99d9-5e747e31947a','e92d0214-b3c4-4902-9dca-e22c19f01e4b','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, BI stakeholder.

I can help verify it, but I need the specific data point, table, dashboard tile, metric, or screenshot you want checked.

Please send any one of these:
- the number/metric you think is wrong
- branch, programme, and date range
- dashboard/tab name
- screenshot or pasted rows
- the SQL/query/output you want validated

Then I’ll check whether the data looks right and, if needed, compare it against BigQuery.',NULL,NULL,'2026-03-18 12:56:05.545287+00'),
('73604291-174d-4d3b-bb7e-dde09d43e286','e92d0214-b3c4-4902-9dca-e22c19f01e4b','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','is this data right?',NULL,NULL,'2026-03-18 13:00:17.680538+00'),
('1808be98-6102-466b-a277-68e8a451195f','e92d0214-b3c4-4902-9dca-e22c19f01e4b','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-18 13:00:20.762247+00'),
('c290cbcc-07f2-4779-bce0-ed75615f4d20','e92d0214-b3c4-4902-9dca-e22c19f01e4b','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','is this data right?',NULL,NULL,'2026-03-18 13:01:17.325932+00'),
('7166b189-eb38-4c4e-be78-bf7139bf01b5','e92d0214-b3c4-4902-9dca-e22c19f01e4b','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb, BI stakeholder.

I can validate it, but I need to check the underlying BigQuery data against the dashboard logic.

From the screenshot alone, the math inside the table is internally consistent:

| Branch | Attendance | Admissions | ATA% |
|---|---:|---:|---:|
| Uttara Branch | 209 | 40 | 19% |
| Panthapath Branch | 212 | 32 | 15% |
| Mirpur Branch | 275 | 17 | 6% |
| Moghbazar Branch | 147 | 37 | 25% |
| Chawkbazar Branch | 234 | 25 | 11% |
| Grand total | 1,077 | 151 | 14.0% ≈ 15% |

A few quick checks:
- Uttara: 40 / 209 = 19.1%
- Panthapath: 32 / 212 = 15.1%
- Mirpur: 17 / 275 = 6.2%
- Moghbazar: 37 / 147 = 25.2%
- Chawkbazar: 25 / 234 = 10.7%
- Total: 151 / 1,077 = 14.0%

So the displayed percentages are rounded, and the branch-level numbers themselves are not obviously broken.

But I cannot confirm whether the data is right without querying the source, because ATA can differ depending on logic such as:
- attendance source table used
- admissions matching logic
- whether both metrics use same last-30-days window
- whether it is branch by attendance branch, admission branch, or booked branch
- whether duplicates are removed by DISTINCT contact/mobile
- whether same-programme matching is applied

If you want, I can verify this against BigQuery now.',NULL,NULL,'2026-03-18 13:01:53.65718+00'),
('c17811d3-c9a2-4b24-837c-f86f9609b910','b2473f4c-befb-4447-bbc9-813e8d010621','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','is this data right?',NULL,NULL,'2026-03-18 13:03:24.394344+00'),
('eed34913-3f39-4dd7-923a-e04092395dfe','b2473f4c-befb-4447-bbc9-813e8d010621','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb (BI),

Short answer: **not reliable enough to call “right” yet**.

The query result is mathematically fine for the SQL it ran, but **the logic is weak for EC ATA validation**.

## What the query currently shows

**Date range used:** last 30 days based on:
- `attendance_date` for attendance
- `admission_date` for admissions

| Branch | Attendance | Admissions | ATA |
|---|---:|---:|---:|
| Chawkbazar Branch | 234 | 63 | 26.92% |
| Mirpur Branch | 250 | 36 | 14.40% |
| Moghbazar Branch | 144 | 71 | 49.31% |
| Panthapath Branch | 197 | 109 | 55.33% |
| Uttara Branch | 201 | 88 | 43.78% |

## Why I would not trust this as final

### 1) Attendance and admission are taken from different populations
This query does:

- attendance = distinct contacts who attended in last 30 days
- admissions = distinct mobiles who admitted in last 30 days

Then it divides one by the other.

That gives a **period ratio**, but not necessarily the operational ATA you likely want. A person admitted this month may have attended earlier. So this can inflate or distort ATA.

### 2) No linkage between attendee and admitted person
For stronger ATA validation, ideally admissions should be checked against people who attended free class, usually by phone number and business rules.

Right now it is just:
- branch-level distinct attendance count
- branch-level distinct admission count

No cohort linkage.

### 3) Branch name consistency risk
The join assumes branch names match perfectly across:
- `Marketing_Leads.offline_leads_api`
- `english_centre.offline_admissions_gsheet_v3`

If branch naming differs even slightly, counts can be misleading.

### 4) Admission source table may not be the cleanest final source
`offline_admissions_gsheet_v3` may be okay for quick checks, but for a “is this data right?” question, I would still verify:
- duplicate mobile handling
- canceled/refunded cases
- branch transfer cases
- same phone multiple admissions in same period

### 5) Distinct mobile may undercount or overcount depending on business definition
If one person takes multiple admissions/programmes, this query counts only **1** per branch in the period.

That may be right or wrong depending on your ATA definition:
- **unique admitted persons**
vs
- **admission events / enrollments**

## My verdict

**Use this only as a rough directional snapshot, not as a validation query.**

If you are asking whether these exact ATA percentages are trustworthy for reporting, my answer is:

**No, not fully.**

## What would make it more correct

You’d want one of these approaches:

### Option A: Same-period operational ATA
If EC’s reporting definition is simply:

> admissions in period / attendance in period

Then the query should still be improved with:
- normalized branch names
- cleaned phone numbers
- exclusion of invalid/canceled rows
- confirmed final attendance source
- confirmed final admission source

### Option B: Cohort ATA
If you want the truer conversion view:

> among those who attended in a period, how many later admitted

Then admissions should be linked back to attendees by phone number, usually with a reasonable conversion window.

That is much more valid analytically.

## Quick observation on the output itself

These numbers are suspicious enough to recheck:
- **Panthapath 55.33%**
- **Moghbazar 49.31%**

Possible, but high enough that I’d verify:
- duplicate attendance suppression
- one person counted once in attendance but multiple operational admissions excluded
- whether walk-in admissions are entering this table
- whether admissions include people who did not attend in the same 30-day window

## Recommended next check

I’d validate with 3 audits:

1. **Branch name mapping audit**
2. **Phone cleaning + duplicate audit**
3. **Cohort-based ATA audit** using attendance-to-admission linkage

If you want, I can help you with the **next SQL** for either:
- a cleaner **same-period ATA**, or
- a proper **cohort ATA** check.',NULL,NULL,'2026-03-18 13:04:27.1023+00'),
('69794fee-aa84-4af4-b0e7-cd3a72c93c27','b2473f4c-befb-4447-bbc9-813e8d010621','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','how many regs today?',NULL,NULL,'2026-03-18 13:05:46.194416+00'),
('9dd4ee6a-157b-4ddc-979a-48bc34153bac','b2473f4c-befb-4447-bbc9-813e8d010621','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-18 13:05:49.200108+00'),
('bedbe100-86ea-4df6-b50c-65173205bcc0','b2473f4c-befb-4447-bbc9-813e8d010621','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','how many regs today?',NULL,NULL,'2026-03-18 13:08:50.162749+00'),
('1edfe2e8-19f8-4738-a078-0a9eccbf3212','b2473f4c-befb-4447-bbc9-813e8d010621','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam da, BI team perspective e today’s **registrations = 106**.

| Metric | Value |
|---|---:|
| Free Class Registrations Today | 106 |

If you want, I can also break this down by **branch, programme, source, or hourly trend** for today.',NULL,NULL,'2026-03-18 13:09:23.358431+00'),
('f18d41f2-8c95-4962-86a9-3239a1606247','b2473f4c-befb-4447-bbc9-813e8d010621','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','validate',NULL,NULL,'2026-03-18 13:10:00.723619+00'),
('7f432b05-87ff-4769-82fd-1a38390c42f2','25bc9169-8ff4-4970-8a2e-0888c4e66313','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','is this data right?',NULL,NULL,'2026-03-18 13:11:50.959119+00'),
('d8f2aede-1914-4cd0-afa1-c587be586718','25bc9169-8ff4-4970-8a2e-0888c4e66313','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hi Uttam Deb (BI),

Short answer: **the math in this query output is right, but whether the data is “right” depends on the business logic you wanted.**

### What this query correctly did
It calculated, for the **last 30 days**:

- **Attendance** = distinct contacts from `offline_leads_api`
- **Admissions** = distinct mobile numbers from `offline_admissions_gsheet_v3`
- **ATA%** = `admissions / attendance`

### Returned result
| Branch | Attendance | Admissions | ATA |
|---|---:|---:|---:|
| Uttara Branch | 201 | 88 | 44% |
| Panthapath Branch | 197 | 109 | 55% |
| Mirpur Branch | 250 | 36 | 14% |
| Moghbazar Branch | 144 | 71 | 49% |
| Chawkbazar Branch | 234 | 63 | 27% |

### Math check
The percentages are arithmetically correct:

- Uttara: 88 / 201 = **43.78%** → **44%**
- Panthapath: 109 / 197 = **55.33%** → **55%**
- Mirpur: 36 / 250 = **14.40%** → **14%**
- Moghbazar: 71 / 144 = **49.31%** → **49%**
- Chawkbazar: 63 / 234 = **26.92%** → **27%**

So **query calculation is fine**.

---

## But there are 3 logic risks

### 1. This is not true cohort ATA
This query compares:
- people who **attended in the last 30 days**
vs
- people who **got admitted in the last 30 days**

These are **two time-period aggregates**, not necessarily the same people.

If you wanted **actual ATA conversion**, it is usually better to calculate:

- among attendees, how many of those attendees later admitted  
or
- admissions attributed to attendees from the same lead/admission journey

So this query gives a **period-level ATA**, not a **cohort conversion ATA**.

---

### 2. Distinct key mismatch may affect accuracy
The query uses:
- `contact` for attendance
- `Mobile_Number` for admissions

If formatting differs across tables, such as:
- `+8801...`
- `8801...`
- `01...`
- spaces or dashes

then counts may still look okay individually, but **cross-source consistency is not guaranteed**.

For branch-level ratio this is less harmful than join-based cohort analysis, but still worth checking.

---

### 3. Branch names may not be standardized
The join is on raw `branch`.

If one table has:
- `Uttara Branch`
and another has
- `Uttara`

then admissions and attendance can split incorrectly.

Your current output looks clean, so probably branch naming matched here, but this is still a common failure point.

---

## Verdict
### If your question is:
**“Did this SQL calculate the displayed ATA correctly?”**  
→ **Yes**

### If your question is:
**“Is this the correct business definition of ATA for EC reporting?”**  
→ **Maybe not**, depending on the dashboard logic.

For G99-style reporting, this query is valid only if your ATA definition is:

> **Admissions in the period / Attendance in the period**

If instead ATA should mean:

> **Attended people who converted**

then this query is **not sufficient**.

---

## My recommendation
You should verify which of these 2 definitions the dashboard uses:

| Definition type | Meaning | This query matches? |
|---|---|---|
| Period ATA | admissions in period / attendance in period | Yes |
| Cohort ATA | admitted from attended people | No |

If you want, I can help with either of these next:

1. **write the correct cohort-based ATA SQL**
2. **audit whether G99 ATA is period-based or cohort-based**
3. **normalize phone numbers and branch names for a cleaner validation**',NULL,NULL,'2026-03-18 13:13:02.247479+00'),
('5f29f9a8-6996-4624-bc80-39d84d5d4baa','cfb6657f-7d9e-4df1-96d5-70c2b56ed8bf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','revenue collected amount month wise since Jan 2026',NULL,NULL,'2026-03-20 08:32:48.710466+00'),
('53fa1416-17e1-407f-9ed3-868c95efe1c4','df5af3b4-beb8-48a9-9b2a-9cbcd1cb5732','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Show Mirpur branch performance today',NULL,NULL,'2026-03-21 19:33:23.497509+00'),
('c9e8d816-4851-4e1f-b7a0-a0586b107e4e','0589bce6-8377-4b6f-adc2-d9bed7bb6134','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hi',NULL,NULL,'2026-03-21 19:35:09.436785+00'),
('5f3be366-d9a5-4e90-9cdc-e7ca28e79400','0589bce6-8377-4b6f-adc2-d9bed7bb6134','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, BI.

How can I help you with EC data today? I can support with registrations, attendance, admissions, RTA, ATA, walk-ins, revenue, branch-wise or ADO-wise breakdowns.',NULL,NULL,'2026-03-21 19:35:16.880966+00'),
('8b56dd7e-b7f3-4027-ac77-a03dc553bd6c','0589bce6-8377-4b6f-adc2-d9bed7bb6134','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hi',NULL,NULL,'2026-03-21 19:35:25.821209+00'),
('4ff1846f-662b-4ce5-9a79-5390c920262c','c7fa36ba-cd9d-48cc-b11e-634b094fbccf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','hi',NULL,NULL,'2026-03-21 19:43:50.59982+00'),
('761f43c3-4f33-4ae5-a83e-16c6cf5b3521','5e2afd49-191c-490d-8aa2-fe3a12e150b2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Bhai — here is the branch-wise RTA performance since **1 Jan 2026**.

**Note:** There is also a **blank branch** group in the result. I am showing it separately because it likely means branch was missing/unmapped in source data.

| Branch | Registrations | Attendance | RTA |
|---|---:|---:|---:|
| Panthapath Branch | 6,093 | 896 | 14.71% |
| Moghbazar Branch | 5,656 | 729 | 12.89% |
| Mirpur Branch | 10,086 | 1,244 | 12.33% |
| Chawkbazar Branch | 9,097 | 852 | 9.37% |
| Uttara Branch | 12,405 | 856 | 6.90% |
| Blank / Unmapped Branch | 4,930 | 0 | 0.00% |

```chart
{
  "type": "bar",
  "title": "Branch-wise RTA since 1 Jan 2026",
  "description": "RTA percentage by branch for registrations submitted from 1 Jan 2026 onward. Blank/unmapped branch data is included separately.",
  "xKey": "branch",
  "series": [
    {
      "key": "rta",
      "label": "RTA %",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "branch": "Panthapath Branch",
      "rta": 14.71
    },
    {
      "branch": "Moghbazar Branch",
      "rta": 12.89
    },
    {
      "branch": "Mirpur Branch",
      "rta": 12.33
    },
    {
      "branch": "Chawkbazar Branch",
      "rta": 9.37
    },
    {
      "branch": "Uttara Branch",
      "rta": 6.9
    },
    {
      "branch": "Blank / Unmapped",
      "rta": 0
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "RTA %"
  }
}
```

### Quick read
- **Best RTA:** Panthapath Branch at **14.71%**
- **Next:** Moghbazar (**12.89%**) and Mirpur (**12.33%**)
- **Lower side:** Chawkbazar (**9.37%**)
- **Lowest among mapped branches:** Uttara (**6.90%**)

### Data observation
- **4,930 registrations** are coming with **no branch mapped**, and naturally showing **0 attendance** here.
- This can drag reporting quality if this bucket is mixed into total views.

If you want, I can also show:
1. **month-wise branch RTA trend since Jan 2026**, or  
2. **same report excluding blank branch records** for a cleaner branch comparison.','like',NULL,'2026-03-21 19:53:17.136155+00'),
('0d8c1a1e-3975-425f-a254-ae8847dd3900','5e2afd49-191c-490d-8aa2-fe3a12e150b2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','create a deep report on it',NULL,NULL,'2026-03-21 19:54:45.911878+00'),
('d1158344-a9f9-4ef2-9ac7-859e417618bf','5e2afd49-191c-490d-8aa2-fe3a12e150b2','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam Deb, BI.

Please specify what “it” refers to so I can create the right deep report.

You can mention any one of these:
1. Registrations
2. Attendance / RTA
3. Admissions / ATA
4. Revenue / Collection / Due
5. Walk-ins / Walk-in admissions
6. CX / Calling Ops performance
7. Branch-wise performance
8. Programme-wise performance
9. ADO-wise performance
10. Full business review for a date range

If you want, you can simply reply in this format:
- Scope:
- Date range:
- Branch:
- Programme:
- Breakdown needed:

Example:
- Scope: Full business review
- Date range: This month till today
- Branch: All
- Programme: All
- Breakdown needed: branch-wise, programme-wise, source-wise, ADO-wise, funnel, revenue, key insights',NULL,NULL,'2026-03-21 19:54:58.716081+00'),
('50fe9855-d5cb-49c7-98b7-3de48b4fc607','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: on for rta by branch, and ata by branch',NULL,NULL,'2026-03-21 20:16:28.792377+00'),
('1ec383fe-eb82-42d0-be1f-28e84542238e','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 20:16:35.14304+00'),
('8b10b4b8-880b-443e-a12c-2d8314672895','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for rta by branch, and another ata by branch',NULL,NULL,'2026-03-21 20:18:17.849968+00'),
('54244d3d-e777-472e-aef6-f03eeca23e72','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 20:18:25.778399+00'),
('0a5725ca-fdbe-4446-807f-55e7c3af0470','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for rta by branch, and another ata by branch',NULL,NULL,'2026-03-21 20:20:47.27284+00'),
('afbd3bfc-8cd6-4460-813b-68e2570cb541','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 20:20:55.38009+00'),
('27ce4ac5-6122-4397-8088-7286638eed37','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for rta by branch, and another ata by branch',NULL,NULL,'2026-03-21 20:21:45.817402+00'),
('3cbd77e2-152d-47ae-8478-e4ca5ef38a81','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 20:21:54.347172+00'),
('0a260977-d99b-49d9-a68c-ea7d187b5a4c','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for rta by branch, and another ata by branch',NULL,NULL,'2026-03-21 20:24:23.485701+00'),
('f41a3d40-67c3-404b-801b-b1583ba14ece','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 20:24:32.556809+00'),
('5f95d38c-1283-48d8-b5e8-3f9ac9d1115a','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 20:26:06.453748+00'),
('81b2e8ce-80aa-4442-bb67-4276207b0335','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 20:26:13.427552+00'),
('759f4456-2389-4e5d-b624-43768523334a','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 20:27:49.530112+00'),
('030fc7b6-f218-4688-9de3-b4053d48556d','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 20:28:05.2906+00'),
('fbb55e4c-9ef3-4346-84b0-6e27cfbbbee8','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 20:39:35.048808+00'),
('9a71f6d8-03ff-4466-842a-2e47a13bb83f','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 20:39:44.468775+00'),
('74926d88-f177-47e9-a444-eddfd12154de','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 20:45:21.420844+00'),
('5adc71a3-7f82-45f0-8512-088ad97daa5f','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 20:45:30.96333+00'),
('b0867635-4267-41e2-8303-4426e1523412','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 21:00:04.18735+00'),
('0b368f1c-f93d-4a09-8c41-4f5efa975dbf','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 21:00:16.175989+00'),
('0b172d36-addb-41d5-a316-96c9164537cf','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 21:11:21.665297+00'),
('0bd34604-7135-4558-8b07-e9966d7f3252','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 21:11:31.590679+00'),
('d4c0b89e-2d06-4ef4-98b3-3b351eda2e64','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 21:17:23.598537+00'),
('eaf69ed8-a6e5-4217-8f55-db8aeac262f0','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','{"output":""}',NULL,NULL,'2026-03-21 21:17:44.144356+00'),
('189b4f5a-3cfd-4642-b97c-bd50c7c80981','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 21:23:59.305706+00'),
('2d794758-17c6-4e00-bb38-b9a69b29867b','d7c282e1-2d10-4556-9633-195771d978ad','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam, Mahmudul Hasan Rezu is listed as the Branch Manager of Mirpur Branch. From the information available here, there is no evidence that he is doing anything wrong. If you want, I can help check a specific performance area for Rezu, such as Mirpur branch registrations, attendance, admissions, walk-ins, or revenue.',NULL,NULL,'2026-03-31 06:35:06.990799+00'),
('6331bf42-f0f7-4468-89a6-e0c965810f04','b686658e-5ed6-4776-9b27-61513dad24d5','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

The upstream agent again ran the **registrations query twice**.  
So right now, only **registrations by branch** is available. **Admissions result is still missing**.

### Registrations by branch
I excluded:
- `NULL` branch
- test/dummy branch values

| Branch | Registrations |
|---|---:|
| Uttara Branch | 89,097 |
| Mirpur Branch | 66,903 |
| Chawkbazar Branch | 39,309 |
| Panthapath Branch | 39,029 |
| Moghbazar Branch | 29,238 |

### Non-reporting rows returned in query
| Branch value | Count |
|---|---:|
| NULL | 11,571 |
| `<test lead: dummy data for আপনি কোন প্রোগ্রামের জন্য ফ্রি ক্লাসে জয়েন করতে চান?>` | 0 |
| `<test lead: dummy data for কোন Branch এ ক্লাস করতে চাও ?>` | 0 |

```chart
{
  "type": "bar",
  "title": "Registrations by Branch",
  "description": "Branch-wise registrations from the returned query result. Excluded NULL and test branch values. No date filter was applied.",
  "xKey": "branch",
  "series": [
    {
      "key": "registrations",
      "label": "Registrations",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "branch": "Uttara Branch",
      "registrations": 89097
    },
    {
      "branch": "Mirpur Branch",
      "registrations": 66903
    },
    {
      "branch": "Chawkbazar Branch",
      "registrations": 39309
    },
    {
      "branch": "Panthapath Branch",
      "registrations": 39029
    },
    {
      "branch": "Moghbazar Branch",
      "registrations": 29238
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Registrations"
  }
}
```

### Correct admissions SQL to run
Please run this separately:

```sql
SELECT
  branch,
  COUNT(DISTINCT Mobile_Number) AS admissions
FROM `tenms-userdb.english_centre.offline_admissions_gsheet_v3`
GROUP BY branch
ORDER BY branch;
```

If you want, I can also give you a **single cleaned SQL pair** with branch cleanup for both registrations and admissions.',NULL,NULL,'2026-03-21 21:26:55.805173+00'),
('97afc9ae-1b70-4a3b-a07e-8b909f9acfdd','7516578c-80e8-422d-8cb6-61235e84ee65','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 21:27:00.478797+00'),
('0c894958-2a89-4e6e-807c-38d25c498146','7516578c-80e8-422d-8cb6-61235e84ee65','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Here are the branch-wise results from the two SQL outputs you shared.

## 1) Registrations by branch
The returned result for SQL 1 appears mislabeled because the schema says `admissions`, although the query was written for registrations. So I’m listing the values exactly as returned.

| Branch | Registrations |
|---|---:|
| Chawkbazar Branch | 1,287 |
| Mirpur Branch | 2,729 |
| Moghbazar Branch | 2,638 |
| Panthapath Branch | 3,401 |
| Uttara Branch | 3,413 |

```chart
{
  "type": "bar",
  "title": "Branch-wise registrations",
  "description": "Distinct contact count by branch based on SQL 1. No date filter was applied in the query.",
  "xKey": "branch",
  "series": [
    {
      "key": "registrations",
      "label": "Registrations",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "branch": "Chawkbazar Branch",
      "registrations": 1287
    },
    {
      "branch": "Mirpur Branch",
      "registrations": 2729
    },
    {
      "branch": "Moghbazar Branch",
      "registrations": 2638
    },
    {
      "branch": "Panthapath Branch",
      "registrations": 3401
    },
    {
      "branch": "Uttara Branch",
      "registrations": 3413
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Registrations"
  }
}
```

## 2) Admissions by branch

| Branch | Admissions |
|---|---:|
| Chawkbazar Branch | 1,287 |
| Mirpur Branch | 2,729 |
| Moghbazar Branch | 2,638 |
| Panthapath Branch | 3,401 |
| Uttara Branch | 3,413 |

```chart
{
  "type": "bar",
  "title": "Branch-wise admissions",
  "description": "Distinct mobile number count by branch based on SQL 2. No date filter was applied in the query.",
  "xKey": "branch",
  "series": [
    {
      "key": "admissions",
      "label": "Admissions",
      "color": "#f59e0b"
    }
  ],
  "data": [
    {
      "branch": "Chawkbazar Branch",
      "admissions": 1287
    },
    {
      "branch": "Mirpur Branch",
      "admissions": 2729
    },
    {
      "branch": "Moghbazar Branch",
      "admissions": 2638
    },
    {
      "branch": "Panthapath Branch",
      "admissions": 3401
    },
    {
      "branch": "Uttara Branch",
      "admissions": 3413
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

## Quick note
Both SQL results returned exactly the same numbers branch-wise, which is unlikely for registrations vs admissions.

Also, SQL 1 result schema shows `admissions` instead of `registrations`, so there may have been an upstream result mix-up.

If you want, I can now help with either of these:
- prepare corrected SQL for both metrics with proper aliases
- add a date filter
- combine both into one branch comparison table with Reg, Admission, and conversion rate',NULL,NULL,'2026-03-21 21:43:39.754432+00'),
('c1ba17a1-c263-4a3f-9fb1-e9d8bf8e3ae9','3084c089-bcbb-4fef-9c49-62b86e979abf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-21 21:43:42.282415+00'),
('22b1a6e1-930c-4d1a-af60-6cc631a3375c','3084c089-bcbb-4fef-9c49-62b86e979abf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Here are the branch-wise numbers from the two SQLs.

## Registrations by branch

Note: SQL 1 also returned some invalid branch values like `NULL` and test dummy labels. I’ve separated the actual branches from those extra rows.

| Branch | Registrations |
|---|---:|
| Uttara Branch | 89,097 |
| Mirpur Branch | 66,903 |
| Chawkbazar Branch | 39,309 |
| Panthapath Branch | 39,029 |
| Moghbazar Branch | 29,238 |

### Extra rows found in registrations result
| Branch Value | Registrations |
|---|---:|
| NULL | 11,571 |
| <test lead: dummy data for আপনি কোন প্রোগ্রামের জন্য ফ্রি ক্লাসে জয়েন করতে চান?> | 0 |
| <test lead: dummy data for কোন Branch এ ক্লাস করতে চাও ?> | 0 |

## Admissions by branch

| Branch | Admissions |
|---|---:|
| Uttara Branch | 3,413 |
| Panthapath Branch | 3,401 |
| Mirpur Branch | 2,729 |
| Moghbazar Branch | 2,638 |
| Chawkbazar Branch | 1,287 |

```chart
{
  "type": "bar",
  "title": "Branch-wise registrations",
  "description": "Registrations grouped by actual branch names from the SQL result. Excludes NULL and test dummy branch values. No date filter was applied.",
  "xKey": "branch",
  "series": [
    {
      "key": "registrations",
      "label": "Registrations",
      "color": "#f59e0b"
    }
  ],
  "data": [
    {
      "branch": "Uttara Branch",
      "registrations": 89097
    },
    {
      "branch": "Mirpur Branch",
      "registrations": 66903
    },
    {
      "branch": "Chawkbazar Branch",
      "registrations": 39309
    },
    {
      "branch": "Panthapath Branch",
      "registrations": 39029
    },
    {
      "branch": "Moghbazar Branch",
      "registrations": 29238
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Registrations"
  }
}
```

```chart
{
  "type": "bar",
  "title": "Branch-wise admissions",
  "description": "Admissions grouped by branch from the SQL result. No date filter was applied.",
  "xKey": "branch",
  "series": [
    {
      "key": "admissions",
      "label": "Admissions",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "branch": "Uttara Branch",
      "admissions": 3413
    },
    {
      "branch": "Panthapath Branch",
      "admissions": 3401
    },
    {
      "branch": "Mirpur Branch",
      "admissions": 2729
    },
    {
      "branch": "Moghbazar Branch",
      "admissions": 2638
    },
    {
      "branch": "Chawkbazar Branch",
      "admissions": 1287
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

### Quick read
- **Highest registrations:** Uttara Branch
- **Second highest registrations:** Mirpur Branch
- **Highest admissions:** Uttara Branch, very slightly ahead of Panthapath
- **Lowest admissions:** Chawkbazar Branch

If you want, I can also give you:
1. a **cleaned SQL version** excluding null/test branches, or  
2. a **combined table with reg-to-admission ratio by branch**.',NULL,NULL,'2026-03-21 21:45:14.887307+00'),
('8133db91-16c2-4edf-ac5e-1a156d2fb4ba','3084c089-bcbb-4fef-9c49-62b86e979abf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','give me rta for february 2026',NULL,NULL,'2026-03-21 21:45:41.02354+00'),
('c36f8c07-d15d-4824-b0a7-ea0a5e205f9a','3084c089-bcbb-4fef-9c49-62b86e979abf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

RTA for **February 2026** is:

| Period | RTA |
|---|---:|
| 1 Feb 2026 to 28 Feb 2026 | **11.08%** |

This was calculated as:
**distinct attended contacts / distinct registered contacts × 100**

Attendance considered:
- `present`
- `present_early`
- `present_late`

If you want, I can also break this down by:
- branch
- programme
- lead source
- day-wise trend for February',NULL,NULL,'2026-03-21 21:45:53.175121+00'),
('11b377e5-ad92-4d57-aa3c-4a69fbea2bd7','3084c089-bcbb-4fef-9c49-62b86e979abf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','thanks',NULL,NULL,'2026-03-21 21:46:51.797893+00'),
('65f18086-e65b-4326-8967-34c197495144','3084c089-bcbb-4fef-9c49-62b86e979abf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam, you’re welcome. Let me know what EC data you need.',NULL,NULL,'2026-03-21 21:46:57.339161+00'),
('ea697857-b798-46a1-a868-21936162623b','3084c089-bcbb-4fef-9c49-62b86e979abf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','Bye',NULL,NULL,'2026-03-21 21:51:53.2359+00'),
('3fc5b71d-2a43-4b7e-8cb1-b539b2c69b05','3084c089-bcbb-4fef-9c49-62b86e979abf','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam, bye. Reach out anytime you need EC data support.',NULL,NULL,'2026-03-21 21:51:59.105431+00'),
('a706f5f0-4a9b-4aaf-971a-b723b97746dd','d737adc6-bdbe-4495-89a3-3e2be58cf63c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','user','run two sqls: one for registrations by branch, and another admissions by branch',NULL,NULL,'2026-03-22 04:24:49.626073+00'),
('c45cddfc-2a4b-452b-9d79-597c4441fd03','d737adc6-bdbe-4495-89a3-3e2be58cf63c','3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','assistant','Hello Uttam,

Here are the two branch-wise outputs from the SQL results.

## Registrations by branch

Note: the registration query returned some non-branch values as well, including `NULL` and test/dummy branch labels. I’m separating those from the actual branch view.

| Branch | Registrations |
|---|---:|
| Uttara Branch | 89,141 |
| Mirpur Branch | 66,935 |
| Chawkbazar Branch | 39,331 |
| Panthapath Branch | 39,051 |
| Moghbazar Branch | 29,252 |

### Extra rows found in registration data
| Branch Value | Registrations |
|---|---:|
| NULL | 11,517 |
| <test lead: dummy data for আপনি কোন প্রোগ্রামের জন্য ফ্রি ক্লাসে জয়েন করতে চান?> | 0 |
| <test lead: dummy data for কোন Branch এ ক্লাস করতে চাও ?> | 0 |

```chart
{
  "type": "bar",
  "title": "Branch-wise registrations",
  "description": "Registrations by branch from the registration query result. Only actual English Centre branches are included; NULL and test branch values are excluded.",
  "xKey": "branch",
  "series": [
    {
      "key": "registrations",
      "label": "Registrations",
      "color": "#3b82f6"
    }
  ],
  "data": [
    {
      "branch": "Uttara Branch",
      "registrations": 89141
    },
    {
      "branch": "Mirpur Branch",
      "registrations": 66935
    },
    {
      "branch": "Chawkbazar Branch",
      "registrations": 39331
    },
    {
      "branch": "Panthapath Branch",
      "registrations": 39051
    },
    {
      "branch": "Moghbazar Branch",
      "registrations": 29252
    }
  ],
  "options": {
    "showGrid": true,
    "showLegend": true,
    "showTooltip": true,
    "yAxisLabel": "Registrations"
  }
}
```

## Admissions by branch

| Branch | Admissions |
|---|---:|
| Uttara Branch | 3,413 |
| Panthapath Branch | 3,401 |
| Mirpur Branch | 2,729 |
| Moghbazar Branch | 2,638 |
| Chawkbazar Branch | 1,287 |

```chart
{
  "type": "bar",
  "title": "Branch-wise admissions",
  "description": "Admissions by branch from the admissions query result. All rows returned were actual branch values.",
  "xKey": "branch",
  "series": [
    {
      "key": "admissions",
      "label": "Admissions",
      "color": "#f59e0b"
    }
  ],
  "data": [
    {
      "branch": "Uttara Branch",
      "admissions": 3413
    },
    {
      "branch": "Panthapath Branch",
      "admissions": 3401
    },
    {
      "branch": "Mirpur Branch",
      "admissions": 2729
    },
    {
      "branch": "Moghbazar Branch",
      "admissions": 2638
    },
    {
      "branch": "Chawkbazar Branch",
      "admissions": 1287
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

## Quick read
- **Highest registrations:** Uttara Branch
- **Highest admissions:** Uttara Branch, very closely followed by Panthapath Branch
- **Data cleanup needed in registrations:** there are **11,517 records with NULL branch** in the source result

If you want, I can also give you:
1. a **single merged table** with registrations + admissions + reg-to-admission ratio by branch, or  
2. **cleaned SQL versions** excluding null/test branch values.',NULL,NULL,'2026-03-22 04:25:38.532282+00')
ON CONFLICT (id) DO NOTHING;