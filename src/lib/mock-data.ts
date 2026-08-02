export type CompanyFit = {
  name: string;
  score: number;
  tier: "Tier 1" | "Tier 2" | "Service";
};

export const COMPANY_FIT: CompanyFit[] = [
  { name: "TCS", score: 95, tier: "Service" },
  { name: "Infosys", score: 92, tier: "Service" },
  { name: "Wipro", score: 91, tier: "Service" },
  { name: "Cognizant", score: 90, tier: "Service" },
  { name: "Capgemini", score: 89, tier: "Service" },
  { name: "Accenture", score: 88, tier: "Service" },
  { name: "Deloitte", score: 80, tier: "Tier 2" },
  { name: "JP Morgan", score: 65, tier: "Tier 2" },
  { name: "Goldman Sachs", score: 50, tier: "Tier 1" },
  { name: "Amazon", score: 45, tier: "Tier 1" },
  { name: "Microsoft", score: 40, tier: "Tier 1" },
  { name: "Google", score: 35, tier: "Tier 1" },
];

export const SCORES = {
  readiness: 84,
  resume: 86,
  ats: 92,
  technical: 81,
  communication: 78,
  github: 74,
  linkedin: 69,
};

export type SkillGap = {
  skill: string;
  severity: "critical" | "high" | "medium";
};

export const SKILL_GAPS: SkillGap[] = [
  { skill: "System Design", severity: "critical" as const },
  { skill: "Kubernetes", severity: "critical" as const },
  { skill: "AWS", severity: "high" as const },
  { skill: "Docker", severity: "high" as const },
  { skill: "Advanced DSA", severity: "medium" as const },
  { skill: "Redis", severity: "medium" as const },
];

export const RADAR_DATA = [
  { axis: "DSA", value: 78 },
  { axis: "Web Dev", value: 88 },
  { axis: "Systems", value: 52 },
  { axis: "DevOps", value: 45 },
  { axis: "AI / ML", value: 64 },
  { axis: "Comm.", value: 78 },
];

export const CONTRIB_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][i],
  commits: Math.round(40 + Math.sin(i / 1.5) * 25 + Math.random() * 30),
}));

export const ROADMAPS: Record<
  string,
  { title: string; weeks: { week: string; items: string[] }[] }
> = {
  Microsoft: {
    title: "Microsoft 4-week sprint",
    weeks: [
      {
        week: "Week 1",
        items: [
          "Arrays & Strings drills",
          "Sliding window patterns",
          "Hashing problems",
        ],
      },
      {
        week: "Week 2",
        items: ["Linked Lists", "Trees & BSTs", "Recursion + Backtracking"],
      },
      {
        week: "Week 3",
        items: [
          "Dynamic Programming",
          "Graphs basics",
          "Behavioral STAR stories",
        ],
      },
      {
        week: "Week 4",
        items: [
          "Mock interviews x3",
          "System design primer",
          "Resume v2 review",
        ],
      },
    ],
  },
  Amazon: {
    title: "Amazon Leadership-Principles sprint",
    weeks: [
      {
        week: "Week 1",
        items: [
          "Two pointers & sliding window",
          "LP stories: Ownership, Bias for Action",
        ],
      },
      {
        week: "Week 2",
        items: ["Trees & Graphs (BFS/DFS)", "LP stories: Customer Obsession"],
      },
      {
        week: "Week 3",
        items: ["DP + Greedy", "OOD: design parking lot, library"],
      },
      {
        week: "Week 4",
        items: ["Mock loop simulation", "Bar-raiser practice"],
      },
    ],
  },
  Google: {
    title: "Google deep-DSA sprint",
    weeks: [
      {
        week: "Week 1",
        items: ["Hard arrays/strings", "Heap & priority queue"],
      },
      { week: "Week 2", items: ["Graphs: Dijkstra, Union-Find", "Tries"] },
      { week: "Week 3", items: ["DP advanced", "Segment trees / BIT"] },
      { week: "Week 4", items: ["Mock interviews x4", "Googleyness review"] },
    ],
  },
  "JP Morgan": {
    title: "JP Morgan finance-tech sprint",
    weeks: [
      {
        week: "Week 1",
        items: ["Java/Spring refresh", "SQL window functions"],
      },
      { week: "Week 2", items: ["OOD + Design patterns", "Threading basics"] },
      { week: "Week 3", items: ["DSA mediums", "Finance domain primer"] },
      { week: "Week 4", items: ["HR + behavioral", "Case study practice"] },
    ],
  },
};

export const COACH_SUGGESTIONS = [
  "How can I improve my resume for product-based companies?",
  "What projects should I build to target Microsoft?",
  "How do I close my DSA gap in 6 weeks?",
  "What should my LinkedIn headline look like?",
];
