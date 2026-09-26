# CloudSweep
 
An AI agent that finds cloud resources nobody remembers turning on — idle instances, orphaned volumes, and forgotten load balancers — prices out exactly what they're costing per month, and drafts a teardown plan for a human to approve. Nothing is ever deleted without explicit sign-off.
 
Built for the **Agents That Act** hackathon theme: *Cloud Cost Janitor*.

 See Doc PDF Here: https://drive.google.com/file/d/1wX0csk-uvUIzHh83UtbgzqmTyTIvfNY2/view?usp=sharing
---
 
## What it does
 
1. **Scans** AWS resource and billing data for three categories of waste:
   - **Idle instances** — average CPU below 5% over a 14-day window
   - **Orphaned volumes** — not attached to any running instance
   - **Forgotten load balancers** — zero healthy registered targets
2. **Calculates** the real monthly cost of every flagged resource
3. **Drafts a teardown plan**, prioritized by potential savings, with a clear reason attached to each item
4. **Gates every deletion behind human approval** — the agent proposes, a person approves, only then does anything get torn down
---
 
## Two versions in this project

| | Purpose | Status |
|---|---|---|
| **Demo build** (`cloudsweep.html`) | Self-contained, zero-dependency interactive demo using mock data. No live API calls, no risk of failure during a presentation. | ✅ Built & published |
| **Real agent** (via TrueForge / AI Studio) | Runs against real AWS billing + inventory data through a live model + tool-calling setup. | 🔧 In progress |
 
The demo build is the safety net for presentation day; the real agent is the "actually works on live data" version.
 
---
 
## Architecture
 
```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  Inventory tool  │────▶│                  │────▶│  Teardown plan      │
│  (boto3: EC2,    │     │   Agent (LLM)    │     │  + confidence per   │
│  EBS, ELB)       │     │  reasoning layer │     │  resource           │
├─────────────────┤     │                  │     └───────────────────┘
│  Cost tool       │────▶│                  │
│  (boto3: Cost     │     └──────────────────┘
│  Explorer/pricing)│              │
└─────────────────┘              ▼
                          ┌──────────────────┐
                          │  Approval gate    │
                          │  (human confirms  │
                          │  before delete)   │
                          └──────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │  Terminate tool   │
                          │  (only runs after │
                          │  approval)        │
                          └──────────────────┘
```
 
**Key components:**
- **Model**: Claude (via TrueForge's Anthropic provider) or Gemini (via AI Studio) — handles detection reasoning and plan drafting
- **Inventory + cost tool**: one combined boto3 function pulling EC2/EBS/ELB state and real billing data (collapsed into a single tool to minimize integration surface)
- **Approval gate**: any tool call that terminates/deletes a resource pauses for explicit human confirmation — no exceptions, regardless of detection confidence
- **Skill / system prompt**: defines detection thresholds, reasoning format, and the hard approval rule (see `system-prompt.md`)
---
 
## Setup
 
### Option A — TrueForge
1. `npx @truefoundry/trueforge`
2. **Settings → Models** → configure Anthropic, add API key
3. **Settings → Connectors** → register the combined boto3 tool (custom, see `/tools`)
4. **Settings → Skills** → add the detection/output-format skill
5. **Build Agent** → paste the system prompt, attach the tool, mark the terminate function as **requires approval**
### Option B — Google AI Studio
1. Create a new prompt, paste the system prompt into **System instructions**
2. Define function declarations for `get_resource_inventory`, `get_resource_cost`, `terminate_resource`
3. In your calling code, pause and prompt for confirmation before executing any `terminate_resource` call — AI Studio has no built-in approval UI, so this gate must be enforced in your own code
### AWS requirements (for either option)
- Free-tier AWS account
- IAM key with read access to EC2, EBS, ELB, and Cost Explorer
- Cost Explorer API charges ~$0.01/request — keep query volume low during testing
---
 
## Testing
 
Use the seeded test prompt in `test-prompt.md` before connecting real AWS data. It includes deliberate edge cases:
- A high-CPU instance that should **not** be flagged
- A volume detached only 40 hours ago that should land in **"needs review"**, not the standard plan
- An attached volume and a healthy load balancer that should both be correctly ignored
If the agent handles all four correctly, the detection logic and output format are working.
 
---
 
## Files in this project
 
- `cloudsweep.html` — the standalone interactive demo (mock data, no dependencies)
- `system-prompt.md` — the full agent role/goals/behavior definition
- `test-prompt.md` — seeded test data with known correct answers
- `README.md` — this file
---
