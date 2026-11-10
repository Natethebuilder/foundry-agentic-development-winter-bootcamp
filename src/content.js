// Shared public content for the landing site and the deck.
// Sessions and owners follow the Foundry Bootcamp deck (v7, slides 8, 11 and 18–23). Session times
// match the Agentic Data Engineering Winter Bootcamp. The six Friday dates are preliminary.
import CONSENT from '../api/consent.json'
import { PREREQUISITES_STATE, REGISTRATION_OPEN, REGISTRATION_OPENS_SOON, REGISTRATION_VIA_FORM } from './siteState.js'

export const BOOTCAMP = {
  name: 'Foundry Agentic Development Winter Bootcamp',
  short: 'Winter Bootcamp',
  tagline: 'Build, evaluate and operate AI agents with Microsoft Foundry.',
  subtitle:
    'Six practical sessions across the agent lifecycle, from a working agent to deployment, operations and organisational governance.',
  season: 'Winter 2026/27',
  kickoffDate: '2026-12-04',
  kickoffLabel: 'Friday, 4 December 2026 · programme starts at 09:00',
  // Add an ISO 8601 time with offset when the start time is confirmed.
  kickoff: null,
  // Switch to true once the six Fridays are confirmed; this removes the "preliminary" labels.
  datesConfirmed: false,
  footer: 'Foundry Agentic Development Winter Bootcamp',
}

export const DATES_NOTE = BOOTCAMP.datesConfirmed ? '' : 'Dates are preliminary and subject to confirmation.'

const ACCENT = {
  build: '#a99bff',
  ground: '#7fb0ff',
  evaluate: '#ffc65c',
  deploy: '#ff8fcf',
  operate: '#6fe0c0',
  govern: '#d7b8ff',
}

export const SESSIONS = [
  {
    id: 'foundations',
    number: '01',
    title: 'Build it - Foundations',
    shortTitle: 'Build it - Foundations',
    track: 'Build',
    subtitle: 'Run a simple hosted agent with a model and one tool',
    ownerId: 'sharanya',
    owner: 'Sharanya Konandur',
    ownerInitials: 'SK',
    time: '09:00',
    audience: 'Everyone',
    format: 'Hosted agent',
    accent: ACCENT.build,
    spotlight: 'What does it take to go from an agent idea to an agent you can run, call and inspect?',
    overview:
      'This foundation session opens with Microsoft’s agent development lifecycle, so you know where every session in the bootcamp fits. You’ll learn the difference between prompt agents and hosted agents, and when you would choose each.\n\nThen you’ll run a simple hosted agent built with Microsoft Agent Framework: a model, simple instructions and one tool. You’ll call its tool and inspect how the agent ran in Microsoft Foundry.',
    outcomes: [
      'Understand the agent development lifecycle and where each session fits',
      'Learn what prompt agents and hosted agents are, and when to choose each',
      'Run a simple hosted agent with a model, simple instructions and one tool',
      'Call the agent’s tool and inspect how it ran in Microsoft Foundry',
    ],
    tools: ['Microsoft Foundry', 'Foundry Agent Service', 'Microsoft Agent Framework', 'Hosted agents', 'Prompt agents', 'Tracing'],
  },
  {
    id: 'advanced-patterns',
    number: '02',
    title: 'Build it - Advanced patterns',
    shortTitle: 'Build it - Advanced patterns',
    track: 'Ground',
    subtitle: 'Ground the agent with retrieval (RAG)',
    ownerId: 'yash',
    owner: 'Yash Singh',
    ownerInitials: 'YS',
    time: '10:00',
    audience: 'AI application developers',
    format: 'RAG with Foundry IQ',
    accent: ACCENT.ground,
    spotlight: 'How do you make an agent answer from your organisation’s knowledge instead of guessing?',
    overview:
      'Retrieval-augmented generation (RAG) grounds an agent in your organisation’s knowledge. In this session you’ll follow the RAG flow end to end: ingest and chunk content, retrieve and filter it with Azure AI Search, and connect it to an agent through Foundry IQ.\n\nThe session stands on its own: you start from a provided starting state, so you don’t need to attend Foundations first.',
    outcomes: [
      'Understand how retrieval-augmented generation grounds an agent',
      'Ingest and chunk organisational knowledge for retrieval',
      'Retrieve and filter content with Azure AI Search',
      'Connect the knowledge to an agent through Foundry IQ',
      'Follow one RAG flow from ingestion to a grounded answer',
    ],
    tools: ['RAG', 'Azure AI Search', 'Foundry IQ', 'Chunking', 'Retrieval filters', 'Embedding models'],
  },
  {
    id: 'evaluate',
    number: '03',
    title: 'Evaluate it',
    shortTitle: 'Evaluate it',
    track: 'Evaluate',
    subtitle: 'Assess agent quality with Foundry evaluations',
    ownerId: 'garima',
    owner: 'Garima Agrawal',
    ownerInitials: 'GA',
    time: '11:00',
    audience: 'Developers & AI engineers',
    format: 'Foundry evaluations',
    accent: ACCENT.evaluate,
    spotlight: 'An agent that runs is not the same as an agent that works. How do you tell the difference?',
    overview:
      'In this session you’ll use Microsoft Foundry’s evaluation capabilities to assess how well an agent does its task, and learn to read what the results do and don’t tell you.\n\nThe application and dataset are provided, ready to evaluate, so you can join without attending the Build it sessions first.',
    outcomes: [
      'Understand why model and prompt changes need evaluation',
      'Use Foundry evaluation capabilities on a provided agent and dataset',
      'Assess how well an agent completes its task',
      'Read evaluation results as evidence, not a guarantee of reliability',
    ],
    tools: ['Foundry evaluations', 'Evaluators', 'Evaluation datasets', 'Agent quality'],
  },
  {
    id: 'deploy',
    number: '04',
    title: 'Deploy it',
    shortTitle: 'Deploy it',
    track: 'Deploy',
    subtitle: 'Set up the infrastructure, then deploy the agent',
    ownerId: 'youssef',
    owner: 'Youssef Baccouche',
    ownerInitials: 'YB',
    time: '12:30',
    audience: 'Platform & cloud engineers',
    format: 'Infrastructure + deployment',
    accent: ACCENT.deploy,
    spotlight: 'What changes when your agent has to run on real infrastructure, with identities, networks and quotas?',
    overview:
      'Deploying an agent is two jobs: setting up the infrastructure it runs on, and deploying the agent itself. In this session you’ll look at both: Microsoft Foundry setup with infrastructure as code, networking, identity and permissions, and then deploying or updating a supplied agent.\n\nAlong the way you’ll keep capacity, quota, scaling and model throughput in view.',
    outcomes: [
      'Separate infrastructure deployment from deploying the agent',
      'Set up Microsoft Foundry infrastructure with Bicep',
      'Understand the networking, identity and permissions an agent needs',
      'Deploy or update a supplied agent',
      'Make capacity, quota and model throughput assumptions explicit',
    ],
    tools: ['Microsoft Foundry', 'Bicep', 'Networking', 'Identity & permissions', 'Quotas & throughput'],
  },
  {
    id: 'operate',
    number: '05',
    title: 'Operate and integrate it',
    shortTitle: 'Operate and integrate it',
    track: 'Operate',
    subtitle: 'Observe, diagnose and improve',
    ownerId: 'mathieu',
    owner: 'Mathieu Rietman',
    ownerInitials: 'MR',
    time: '13:30',
    audience: 'Developers & operations teams',
    format: 'Observe → diagnose → improve',
    accent: ACCENT.operate,
    spotlight: 'What do you do when your agent technically succeeds but still fails the task?',
    overview:
      'Once an agent is running, the work becomes observe → diagnose → improve. In this session you’ll use traces, failed tool calls, task failures, feedback and cost to understand how a running agent behaves, find out what went wrong and improve it.\n\nWhere access allows, the session also demonstrates how agents reach people through Microsoft 365 and Teams.',
    outcomes: [
      'Observe a running agent through its traces',
      'Diagnose failed tool calls and task failures',
      'Use operational feedback and cost to decide what to improve',
      'Improve the agent and confirm the fix',
    ],
    tools: ['Tracing', 'Application Insights', 'User feedback', 'Cost', 'Microsoft 365 & Teams (demo)'],
  },
  {
    id: 'govern',
    number: '06',
    title: 'Govern it',
    shortTitle: 'Govern it',
    track: 'Govern',
    subtitle: 'Organise ownership and control across teams',
    ownerId: 'sushil',
    owner: 'Sushil Kumar Jha',
    ownerInitials: 'SJ',
    time: '14:30',
    audience: 'Architects & platform teams',
    format: 'Organisation + enforcement',
    accent: ACCENT.govern,
    spotlight: 'When several teams build and run agents, who owns what, and how do you enforce it?',
    overview:
      'Governance starts with people and process. In this session you’ll look at what happens when several teams build and operate agents: centralised versus decentralised control, Foundry and project ownership, responsibilities, access, approved models and shared policies.\n\nThen you’ll see how to enforce those decisions technically, for example with an AI gateway in Azure API Management, with the Citadel blueprint as one example reference.',
    outcomes: [
      'Compare centralised and decentralised control of agent development',
      'Organise Foundry and project ownership, responsibilities and access',
      'Agree approved models and shared policies across teams',
      'See how an AI gateway can enforce those decisions',
    ],
    tools: ['Ownership & access', 'Approved models', 'Shared policies', 'AI gateway', 'Azure API Management', 'Citadel blueprint'],
  },
]

export const SESSION_DATES = [
  { id: '2026-12-04', label: 'Friday, 4 December 2026', short: '4 Dec', day: '04', month: 'DEC' },
  { id: '2026-12-11', label: 'Friday, 11 December 2026', short: '11 Dec', day: '11', month: 'DEC' },
  { id: '2026-12-18', label: 'Friday, 18 December 2026', short: '18 Dec', day: '18', month: 'DEC' },
  { id: '2027-01-08', label: 'Friday, 8 January 2027', short: '8 Jan', day: '08', month: 'JAN' },
  { id: '2027-01-15', label: 'Friday, 15 January 2027', short: '15 Jan', day: '15', month: 'JAN' },
  { id: '2027-01-22', label: 'Friday, 22 January 2027', short: '22 Jan', day: '22', month: 'JAN' },
]

export const registrationSlotId = (dateId, session) => `${dateId}|${session.time}|${session.id}`

export const PERSONAS = [
  {
    id: 'developers', icon: '🧑‍💻', label: 'AI application developers',
    desc: 'Build, ground and evaluate agents that do real work.',
    does: 'Go from a simple hosted agent to grounded, evaluated behaviour, using Microsoft Foundry and the languages you already code in.',
    stack: ['Foundry Agent Service', 'Agent Framework', 'RAG', 'Evaluations'],
  },
  {
    id: 'architects', icon: '🏗️', label: 'Solution & cloud architects',
    desc: 'Shape how agents are deployed, integrated and governed.',
    does: 'Design the infrastructure, identity and integration choices that take an agent from a demo to an operable application.',
    stack: ['Bicep', 'Identity', 'Networking', 'AI gateway'],
  },
  {
    id: 'platform', icon: '⚙️', label: 'Platform & AI engineers',
    desc: 'Run agents reliably with the right capacity and controls.',
    does: 'Provision Foundry, keep quota and throughput in view, and observe, diagnose and improve the agents that run on it.',
    stack: ['Microsoft Foundry', 'Quotas', 'Tracing', 'Policies'],
  },
  {
    id: 'product', icon: '🎯', label: 'Technical product & build teams',
    desc: 'Connect what agents do to measurable outcomes.',
    does: 'Define what good looks like, read evaluation evidence and decide when an agent is ready for the people who will use it.',
    stack: ['Evaluations', 'Feedback', 'Cost', 'Governance'],
  },
]

export const TEAM = [
  { id: 'sharanya', name: 'Sharanya Konandur', initials: 'SK', role: 'Session owner', focus: 'Build it - Foundations', accent: ACCENT.build, photo: 'speakers/sharanya.jpg' },
  { id: 'yash', name: 'Yash Singh', initials: 'YS', role: 'Session owner', focus: 'Build it - Advanced patterns', accent: ACCENT.ground, photo: 'speakers/yash.jpg' },
  { id: 'garima', name: 'Garima Agrawal', initials: 'GA', role: 'Session owner', focus: 'Evaluate it', accent: ACCENT.evaluate, photo: 'speakers/garima.jpg' },
  { id: 'youssef', name: 'Youssef Baccouche', initials: 'YB', role: 'Session owner', focus: 'Deploy it', accent: ACCENT.deploy, photo: 'speakers/youssef.jpg' },
  { id: 'mathieu', name: 'Mathieu Rietman', initials: 'MR', role: 'Session owner', focus: 'Operate and integrate it', accent: ACCENT.operate, photo: 'speakers/mathieu.jpg' },
  { id: 'sushil', name: 'Sushil Kumar Jha', initials: 'SJ', role: 'Session owner', focus: 'Govern it', accent: ACCENT.govern, photo: 'speakers/sushil.jpg' },
]

export const sessionOwner = (session) =>
  TEAM.find((person) => person.id === session.ownerId) ?? { name: session.owner, initials: session.ownerInitials }

// Session owners and their headshots are hidden for now, and the headshots are not published. To show them
// again, restore the headshots (git checkout f33f10f -- public/speakers) and set this to true: they reappear on
// the website (lineup, schedule and registration) and in the deck (session slides and the team slide).
export const SHOW_SESSION_OWNERS = false

// The lineup reveal: a programme agent hands off to one session per lifecycle stage.
export const LINEUP = {
  title: 'Run the programme.',
  subtitle: `Start the programme agent, then explore each session${SHOW_SESSION_OWNERS ? ', its owner' : ''} and what you will learn.`,
  agent: 'programme-agent',
  coreTitle: 'Programme agent',
  coreDetail: 'orchestrator · 6 handoffs',
  run: 'Run the programme agent',
  running: 'Handing off to six sessions…',
  done: 'All six sessions are ready. Select a stage to jump to its session.',
}

// Each pillar's `id` selects its animated glyph in src/agentic/PillarMark.jsx.
export const PILLARS = [
  {
    id: 'lifecycle',
    tag: '6 stages · 1 loop',
    title: 'The whole agent lifecycle',
    desc: 'Go from a working agent to grounding, evaluation, deployment, operations and governance in Microsoft Foundry.',
  },
  {
    id: 'standalone',
    tag: 'Standalone, connected',
    title: 'Every session stands alone',
    desc: 'Every session brings its own starting state, so you can join one or all six. Follow them in order and each session builds on the last.',
  },
  {
    id: 'handson',
    tag: 'Learn → see → build',
    title: 'Concept first, then hands-on',
    desc: 'Learn the concept, see how Microsoft Foundry implements it, then follow along with prepared steps.',
  },
]

export const INVITATION = {
  mark: '✉',
  eyebrow: 'Formal invitation',
  description: 'You will receive a formal invitation with more details closer to the date of the bootcamp.',
}

// Hero console: one example agent at every stage of the lifecycle, shown the way Microsoft Foundry traces it.
// `session` links each run to SESSIONS for its number, track and accent colour. The first span is the root of
// the trace and the rest are its children.
export const AGENT_RUNS = [
  {
    session: 'foundations',
    area: 'Agents',
    actor: 'user',
    input: 'Should I take an umbrella to Amsterdam tomorrow?',
    spans: [
      { op: 'invoke_agent', name: 'my-agent', meta: '1.9 s' },
      { op: 'chat', name: 'plan the next step', meta: '0.4 s' },
      { op: 'execute_tool', name: 'get_forecast', meta: 'rain · 80%' },
      { op: 'chat', name: 'reply to the user', meta: '0.8 s' },
    ],
    result: 'Hosted agent run traced in Foundry',
  },
  {
    session: 'advanced-patterns',
    area: 'Knowledge',
    actor: 'user',
    input: 'Summarise the latest release notes and cite your sources',
    spans: [
      { op: 'invoke_agent', name: 'my-agent', meta: '2.4 s' },
      { op: 'execute_tool', name: 'search_knowledge', meta: 'Foundry IQ' },
      { op: 'retrieval', name: 'filter: release notes', meta: '3 sources' },
      { op: 'chat', name: 'answer with citations', meta: '1.1 s' },
    ],
    result: 'Grounded answer with 3 citations',
  },
  {
    session: 'evaluate',
    area: 'Evaluations',
    actor: 'dev',
    input: 'Evaluate v2 on 50 test conversations before we ship it',
    spans: [
      { op: 'evaluation', name: 'my-agent v2', meta: '50 conversations' },
      { op: 'evaluator', name: 'task_adherence', meta: '46 / 50' },
      { op: 'evaluator', name: 'tool_call_accuracy', meta: '4.6 / 5' },
      { op: 'compare', name: 'v1 → v2', meta: '2 regressions' },
    ],
    result: 'Evaluation report ready to review',
  },
  {
    session: 'deploy',
    area: 'Deployments',
    actor: 'dev',
    input: 'Deploy the Foundry infrastructure with Bicep, then roll out agent v2',
    spans: [
      { op: 'deployment', name: 'infra/main.bicep', meta: 'succeeded' },
      { op: 'identity', name: 'managed identity + RBAC', meta: 'assigned' },
      { op: 'quota', name: 'model throughput', meta: 'within limits' },
      { op: 'publish', name: 'my-agent v2', meta: 'live' },
    ],
    result: 'Agent v2 deployed on your infrastructure',
  },
  {
    session: 'operate',
    area: 'Tracing',
    actor: 'ops',
    input: 'Why do some runs finish without completing the task?',
    spans: [
      { op: 'traces', name: 'last 24 hours', meta: '12 failed tasks' },
      { op: 'execute_tool', name: 'get_forecast', meta: 'timed out' },
      { op: 'feedback', name: 'user ratings', meta: '8 negative' },
      { op: 'fix', name: 'retry the tool before answering', meta: 'proposed' },
    ],
    result: 'Fix ready to evaluate before release',
  },
  {
    session: 'govern',
    area: 'Governance',
    actor: 'admin',
    input: 'Onboard team B’s agent with approved models and token limits',
    spans: [
      { op: 'project', name: 'team-b', meta: 'owner assigned' },
      { op: 'policy', name: 'approved models only', meta: 'applied' },
      { op: 'ai_gateway', name: 'token limits per team', meta: 'enforced' },
      { op: 'audit', name: 'access and usage', meta: 'logged' },
    ],
    result: 'Team B onboarded with guardrails',
  },
]

// Prerequisites, by PREREQUISITES_STATE in api/site-state.json.
export const PREREQUISITES = {
  soon: {
    title: 'Pre-flight checks',
    subtitle: 'Everything you need to get ready for the hands-on sessions will be published here.',
    mark: '⏳',
    label: 'Coming soon',
    heading: 'This information will be shared soon.',
    body: 'We will publish the prerequisites and setup steps for every session here, and include them in your formal invitation closer to the date.',
  },
  microhack: {
    title: 'Pre-flight checks',
    subtitle: 'The hands-on labs run in MicroHack environments. Tick off these checks before your session; progress stays in this browser only.',
  },
}

// MicroHack preparation (deck slide 13). Used when prerequisites is "microhack".
export const MICROHACK_ACCESS = [
  {
    id: 'azure',
    title: 'Azure access by email',
    desc: 'Before your session, you receive temporary Azure credentials by email for that session’s lab.',
  },
  {
    id: 'labs',
    title: 'One lab repository per session',
    desc: 'Every session has its own GitHub repository, forked from MicroHack, with a standalone entry point.',
  },
  {
    id: 'github',
    title: 'GitHub only if needed',
    desc: 'You only need GitHub access if your session uses it. Your invitation will tell you.',
  },
]

export const PREP = [
  { id: 'azure', icon: '☁️', title: 'Azure knowledge', desc: 'You know your way around the Azure portal, subscriptions and resource groups.' },
  { id: 'git', icon: '🌿', title: 'Git basics', desc: 'You can clone a repository and follow its README. Every lab lives in its own repository.' },
  { id: 'email', icon: '✉️', title: 'An email address you can reach', desc: 'Azure access uses temporary credentials sent to you by email before the session.' },
  { id: 'github', icon: '🐙', title: 'A GitHub account, if needed', desc: 'Only when your session uses GitHub. Your invitation will tell you.' },
  { id: 'entry', icon: '🧭', title: 'Your session’s entry point', desc: 'Each session shares any extra prerequisites and a standalone entry point for its lab.' },
  { id: 'data', icon: '🔒', title: 'Sample data only', desc: 'No customer, personal or production data. Labs use sample or non-sensitive data.' },
]

export const MICROHACK_RESOURCES = [
  { id: 'azure', label: 'Azure fundamentals', detail: 'Cloud concepts on Microsoft Learn', href: 'https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/' },
  { id: 'git', label: 'Introduction to Git', detail: 'Git basics on Microsoft Learn', href: 'https://learn.microsoft.com/training/modules/intro-to-git/' },
  { id: 'foundry', label: 'What is Microsoft Foundry?', detail: 'Product overview on Microsoft Learn', href: 'https://learn.microsoft.com/azure/foundry/what-is-foundry' },
  { id: 'microhack', label: 'MicroHack', detail: 'The repository the session labs are forked from', href: 'https://github.com/microsoft/MicroHack' },
]

export const REGISTER_STEPS = [
  'Enter and confirm your company email address',
  REGISTRATION_VIA_FORM
    ? 'Choose a date for each session you want to attend, and your development environment'
    : 'Choose the dates, session times and development environment you need',
  'Receive a formal invitation with more details closer to the date',
]

export const REGISTRATION = {
  eyebrow: 'Registration',
  title: 'Join the Foundry Agentic Development Winter Bootcamp.',
  subtitle: 'Confirm your company email, choose the dates and session times you want to attend, and tell us which development environment you need.',
  slotLead: 'Pick as many sessions as you like, on as many dates as you like.',
  slotHelp: 'Every date runs the same six sessions, so you can mix and match, for example Foundations on 4 December and Evaluate it on 11 December. Switch dates with the tabs below; sessions you have ticked on other dates stay selected.',
  environments: [
    {
      id: 'local',
      label: 'I will use my own machine',
      desc: 'Choose this if you can install tools locally. Setup details follow with the prerequisites.',
    },
    {
      id: 'cloud',
      label: 'I need a cloud development environment',
      desc: 'Places are limited. Selecting this records your request but does not guarantee a place.',
    },
  ],
  // The wording and its version live in api/consent.json, so the API can record which version each
  // registrant agreed to. When the wording changes, set the version to the date it goes live and add
  // it to "Consent wording versions" in docs/registration-backend.md.
  consent: CONSENT.wording,
  // The API answers a new registration and an already registered email address the same way, so
  // "received" must be true for both.
  received: 'Thanks, we’ve received your registration. If this email address was already registered, your original registration is unchanged. To change it, contact the Microsoft contact who invited you. You will receive a formal invitation by email closer to the date of the bootcamp.',
  updated: 'Thanks, your registration has been updated. You will receive a formal invitation by email closer to the date of the bootcamp.',
  startOver: 'Not you? Start a new registration',
}

// Shown in place of the on-site form while registration is 4 in api/site-state.json, when
// registrations go to this bootcamp's Microsoft Form. Nothing loads from Microsoft Forms until the
// visitor starts. The form takes one date per session (or None), unlike the on-site form, which takes
// any combination of dates and sessions. docs/registration-form/README.md records its questions.
export const REGISTRATION_FORM = {
  subtitle: 'Register through our Microsoft Form. It takes about two minutes: confirm your company email, choose a date for each session you want to attend, and tell us which development environment you need.',
  sessionChoice: 'When you register, choose a date for each session you want to attend.',
  agendaNote: 'In the registration form, choose one date for each session, or None to skip it.',
  mark: '📝',
  badge: 'Registration is open',
  heading: 'Register with our Microsoft Form',
  body: 'The form opens right here on this page. Have these ready:',
  needs: [
    'Your company or organisation',
    'Your company email address, entered twice to confirm it',
    'The sessions you want to attend and a date for each',
    'Your development environment: your own machine or a cloud environment',
    'Your consent to how we use your registration details',
  ],
  start: 'Start registration',
  newTab: 'Open the form in a new tab',
  provider: 'The form is provided by Microsoft Forms.',
  providerBeforeStart: 'The form is provided by Microsoft Forms and loads only when you start.',
  frameTitle: 'Foundry Agentic Development Winter Bootcamp registration form (Microsoft Forms)',
}

// Shown everywhere registration appears while registration is 2 in api/site-state.json.
export const REGISTRATION_SOON = {
  mark: '📅',
  eyebrow: 'Registration',
  title: 'Registration will open soon.',
  subtitle: 'We are putting the finishing touches on the programme. Check back soon to choose your dates and sessions.',
  badge: 'Opening soon',
  heading: 'Registration will open soon',
  body: 'All six sessions run on every date, so once registration opens you can pick as many sessions as you like, on as many dates as you like.',
  cta: 'Registration opens soon',
}

// Shown everywhere registration appears while registration is 3 in api/site-state.json, or any value
// that is not a known state.
export const REGISTRATION_CLOSED = {
  mark: '🔒',
  eyebrow: 'Registration',
  title: 'Registration is closed.',
  subtitle: 'This bootcamp is no longer accepting registrations.',
  badge: 'Closed',
  heading: 'Registration is closed',
  body: 'If you have a question about an existing registration, ask the Microsoft contact who invited you.',
  cta: 'Registration closed',
}

// What every register entry point shows while registration is not open.
export const REGISTRATION_NOTICE = REGISTRATION_OPENS_SOON ? REGISTRATION_SOON : REGISTRATION_CLOSED

export const FAQ = [
  {
    q: 'What are the session topics?',
    a: 'Build it - Foundations, Build it - Advanced patterns, Evaluate it, Deploy it, Operate and integrate it, and Govern it: the agent lifecycle in Microsoft Foundry, from a working agent to deployment, operations and organisational governance.',
  },
  {
    q: 'When does it start?',
    a: `The complete six-session programme runs on Friday 4, 11 and 18 December 2026, followed by Friday 8, 15 and 22 January 2027. Sessions start at 09:00, 10:00, 11:00, 12:30, 13:30 and 14:30.${DATES_NOTE ? ` ${DATES_NOTE}` : ''}`,
  },
  {
    q: 'Who is it for?',
    a: 'AI application developers, solution and cloud architects, platform and AI engineers, and technical product and build teams.',
  },
  {
    q: 'Do I need to attend every session?',
    a: 'No. Every session stands on its own and provides its own starting state. Join one session, a few, or all six on the same Friday, or spread them over several dates.',
  },
  {
    q: 'Is it hands-on?',
    a: 'Each one-hour session is a 10-minute introduction, a 40-minute follow-along demonstration with prepared steps, and a 10-minute recap. If you can’t build along, follow the presenter live.',
  },
  {
    q: 'What do I need to prepare?',
    a: PREREQUISITES_STATE === 'microhack'
      ? 'Basic Azure knowledge, Git basics and an email address you can reach: Azure access uses temporary credentials sent by email before the session. You only need GitHub if your session uses it.'
      : 'The prerequisites and setup steps will be shared soon, here and in your formal invitation.',
  },
  {
    q: 'What does it cost?',
    a: 'The bootcamp is free to attend.',
  },
  {
    q: 'How do I register?',
    a: REGISTRATION_VIA_FORM
      ? 'Start the Microsoft Form in the Register section of this page, or open it in a new tab. Enter and confirm your company email, choose a date for each session you plan to attend, and select your development environment. You will receive a formal invitation with more details closer to the date.'
      : REGISTRATION_OPEN
        ? 'Provide and confirm your company email, choose the dates and session times you plan to attend, and select your development environment. You will receive a formal invitation with more details closer to the date.'
        : REGISTRATION_OPENS_SOON
          ? 'Registration will open soon. When it does, you confirm your company email, choose the dates and session times you plan to attend, and select your development environment.'
          : `Registration is closed. ${REGISTRATION_CLOSED.body}`,
  },
]
