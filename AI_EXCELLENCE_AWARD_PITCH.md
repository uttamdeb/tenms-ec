# 10MS Data Agent - AI Excellence Award Pitch

## One-Line Pitch

10MS Data Agent is an internal AI data analyst for 10 Minute School and English Centre operations that turns plain-English business questions into usable answers, charts, tables, and dashboards in minutes, so no one has to wait hours or days for basic data analysis anymore.

## Elevator Pitch

Every company says it is data-driven. Then someone asks, "How many tokens were started yesterday by branch?" and suddenly a human analyst, three SQL tabs, two follow-up messages, and one calendar day are involved.

10MS Data Agent fixes that gap. It understands 10MS and EC context, talks to the data stack, generates and runs the required queries, explains the answer in business language, and can turn the result into charts, tables, downloadable files, or dashboard elements. It is not trying to replace analysts. It is trying to save them from becoming a full-time "can you pull this number?" department, which is a noble but deeply boring fate.

The result is simple: teams can ask operational questions directly, get fast answers with supporting data, and make decisions while the question is still relevant.

## 6. Brief About The Initiative

10MS Data Agent was initiated to remove one of the most common bottlenecks in day-to-day operations: waiting for basic data analysis. Branch teams, operations leads, product owners, and business stakeholders often need quick answers about admissions, attendance, revenue collection, renewals, token activity, classroom operations, tele-eligible leads, online product movement, and other EC/10MS metrics. Before this, even simple questions could require asking a BI or data person, waiting for SQL to be written, waiting for clarifications, then waiting again because the first answer created three more questions. Very efficient, if the goal was to convert curiosity into delay.

The agent gives authorized users a natural-language interface over the business data context of 10MS and English Centre. A user asks a question in normal language. The frontend authenticates the user and sends the request through Supabase Edge Functions to the n8n agent workflow. The backend workflow interprets the intent, uses the relevant business context, generates SQL, runs BigQuery, and returns a business-readable answer along with structured outputs such as tables, charts, SQL traces, and query results.

The frontend then renders the response as a usable analysis experience: chat answers, tables, charts, downloadable artifacts, saved history, gallery views, and BI-only dashboards. Dashboards let BI users save useful answers, tables, and charts into EC or 10MS-specific dashboard workspaces, then manually refresh them when updated data is needed. Manual refresh keeps the cost and compute behavior controlled instead of quietly burning resources while everyone is asleep.

In short, this is a self-serve analytics layer for 10MS operations. It reduces the dependency on ad hoc analyst requests, speeds up decisions, and gives the business a way to ask data questions at the speed of thought, or at least at the speed of a reasonably caffeinated AI agent.

## What It Does

- Answers operational and business questions in natural language.
- Understands separate EC and 10MS contexts, so branch-level and online-segment questions do not get mixed.
- Produces explanations, tables, charts, and downloadable results.
- Keeps chat history separated by workspace and user session.
- Supports image-based context in chat where needed.
- Lets BI users inspect executed SQL and raw BigQuery results for traceability.
- Lets BI users save charts, tables, and insights into dashboards.
- Supports up to 10 dashboards per workspace, with rename, remove, resize, date filters, and manual refresh.
- Uses Supabase Auth, Supabase Postgres, Edge Functions, n8n, BigQuery, Recharts, and the existing 10MS account/login flow.

## 7. Impact Of The Initiative - S.M.A.R.T. Bullet Points

- **Specific:** Reduces the turnaround time for common business questions across EC and 10MS operations, including branch performance, admissions, attendance, revenue collection, token activity, tele-eligible leads, renewals, classroom operations, and online product metrics.

- **Measurable:** The initiative can be tracked through number of chat questions answered, dashboards created, refreshes triggered, SQL runs executed, BI-only inspections, repeat requests avoided, and estimated analyst hours saved. A conservative model: if 20 users save only 30 minutes per working day, that is around 10 hours saved per day and roughly 200 hours per month. That is before counting faster decisions, fewer follow-up pings, and the emotional value of not opening another spreadsheet at 11:47 PM.

- **Achievable:** The system is already implemented using our existing stack: React, Supabase Auth/Postgres/Edge Functions, n8n agent workflows, BigQuery, and Azure-backed AI infrastructure. We are also using Azure credits, so the current AI compute cost is effectively sponsored by the rarest stakeholder of all: free money.

- **Relevant:** Faster access to analysis directly improves operational decision-making. Branch and business teams can identify weak spots, compare performance, review trends, and act without waiting for a manual reporting cycle. BI teams can focus on deeper analysis, data quality, forecasting, and strategic work instead of answering the same "quick question" in twelve different phrasings.

- **Time-bound:** The dashboard feature is initially limited to BI users for controlled testing. After validation, the plan is to roll it out to broader roles in phases. Usage, accuracy, refresh behavior, and adoption can be reviewed weekly during the pilot and used to decide when to expand access.

## Startup-Style Pitch

### The Problem

Business teams do not have a shortage of questions. They have a shortage of instant, reliable answers.

The old workflow looks like this:

1. Someone asks a basic data question.
2. A BI/data person has to understand the business context.
3. Someone writes SQL.
4. Someone checks the SQL.
5. Someone exports or screenshots the result.
6. The original user asks a follow-up question because, naturally, seeing data creates more questions.

This is not a bad process for complex analysis. It is a terrible process for everyday operational visibility.

### The Solution

10MS Data Agent acts like a business-aware analytics teammate. It knows the operational context, connects to the data workflow, generates the relevant query, runs it, explains the result, and renders the output in a form people can actually use.

Instead of turning every data question into a mini-project, the agent turns it into a conversation.

### Why It Matters

The value is not just that the agent can make charts. Charts are nice. So are staplers. The value is that the agent compresses the time between asking a business question and taking an operational action.

When a branch lead can ask about yesterday's admissions, token movement, or attendance trend and get an answer immediately, decisions move faster. When BI users can save useful outputs into dashboards and refresh them manually, repeated analysis becomes reusable. When SQL and raw results remain inspectable for BI users, the system stays auditable instead of becoming a magical black box with a nice gradient.

### Why Now

10MS teams already have more data than any normal human should be expected to manually chase across tools. The missing layer is not another dashboard graveyard. It is a conversational, context-aware interface that lets people ask the next question immediately.

Also, we currently have Azure credits, which means the AI cost story is unusually friendly. We should probably use that before finance realizes "free AI compute" sounds suspiciously like a challenge.

## Product Highlights

- **Self-serve analytics:** Users ask natural-language questions and receive business-ready answers.
- **Context-aware workspaces:** EC and 10MS modes keep history, prompts, and dashboards separated.
- **Charts and tables:** Agent outputs can be rendered visually, saved, copied, or downloaded.
- **Dashboards:** BI users can build reusable dashboards from chat outputs, with date filters and manual refresh.
- **Traceability:** BI users can inspect SQL and BigQuery results behind answers.
- **Controlled rollout:** Dashboard access is role-gated to BI users first, protecting existing workflows for everyone else.
- **Cost control:** Manual refresh and cached dashboard data prevent unnecessary background computation.
- **Existing account system:** Login and user profile flows use the 10MS/Supabase auth setup.

## Technical Architecture

1. **Frontend:** React, TypeScript, Vite, shadcn/ui, Tailwind, Recharts, and lazy-loaded exports.
2. **Auth and storage:** Supabase Auth, Postgres, Storage, and role-based profile access.
3. **Agent gateway:** Supabase Edge Function proxies chat requests and manages async job callbacks.
4. **Agent workflow:** n8n workflow handles intent, context, SQL generation, BigQuery execution, and response synthesis.
5. **Data execution:** BigQuery is used for analytical query execution.
6. **Dashboards:** Dashboard tables store user dashboards, dashboard elements, refresh jobs, and cached element output.
7. **Auditability:** SQL runs and structured query runs are persisted so BI users can inspect and dashboard refreshes can rerun the right queries.

## 8. Relevant Links

- Live app: https://tenms-data-agent.lovable.app/
- n8n agent workflow: https://n8n-prod.10minuteschool.com/workflow/50gjYoQTSX2JIys9
- Suggested demo flow:
  - Ask an EC branch performance question.
  - Show the generated answer, table, and chart.
  - Save the chart/table to a dashboard.
  - Change the dashboard date filter and manually re-fetch.
  - Show BI SQL/query inspection for traceability.

## 9. Sustainability And Future Plans

The initiative is designed to be sustainable because it builds on tools already in use: Supabase, n8n, BigQuery, the 10MS account flow, and Azure-backed AI resources. The current Azure credits make the AI infrastructure cost effectively free during the pilot, which gives us room to test adoption, accuracy, and operational value before scaling.

The rollout plan is intentionally controlled. Dashboards are initially available only to BI users, so we can validate query refresh behavior, chart rendering, access rules, and data quality without disrupting existing non-BI users. Once tested, access can expand gradually to operations, branch leadership, product, and other teams.

Future improvements can include:

- A stronger semantic layer for common business definitions.
- More dashboard filter types beyond date range.
- Scheduled insight summaries for managers.
- Proactive anomaly detection for branch and revenue metrics.
- Recommended follow-up questions after each answer.
- Saved organization-level dashboard templates.
- Better cost monitoring by usage, user, mode, and query volume.
- More approval and guardrail flows for sensitive data.

The long-term vision is not just "AI that answers questions." The vision is a company where basic data analysis is no longer trapped behind manual request queues, and BI teams can spend more time on high-value analysis instead of repeatedly proving that yesterday did, in fact, happen.

## 60-Second Presentation Script

Hi, we are pitching 10MS Data Agent, an internal AI data analyst for 10MS and English Centre operations.

The problem is simple: teams need data every day, but even basic questions often take hours or days because someone has to ask a BI person, explain context, wait for SQL, wait for the result, then ask a follow-up question. It works, but so does walking to Chattogram. We can do better.

Our agent lets authorized users ask business questions in normal language. It understands EC and 10MS context, runs the right data workflow, generates SQL, executes BigQuery, and returns a clear answer with tables, charts, and downloadable outputs. BI users can inspect the SQL and save useful results into dashboards that can be manually refreshed.

The impact is faster decision-making, fewer repetitive data requests, and more time for BI teams to do actual analysis instead of becoming a human search bar for spreadsheets. With Azure credits, our current AI compute cost is effectively covered during the pilot, so this is the rare AI project where the cost slide is not immediately terrifying.

Our ask is simple: help us roll this out responsibly, measure usage and saved time, and turn 10MS Data Agent into the default way teams ask operational data questions.

## Closing Line

10MS Data Agent does not just make dashboards prettier. It makes waiting for basic data analysis feel outdated, which, frankly, it should.
