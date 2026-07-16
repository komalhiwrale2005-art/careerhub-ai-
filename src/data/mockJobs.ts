import { Job } from "../types";

export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Senior AI Research Scientist",
    company: "Tokyo Tech GenomX",
    logoBg: "bg-indigo-600",
    location: "Tokyo, Japan",
    country: "Japan",
    visaStatus: "Full Sponsorship",
    relocationSupport: "Full Relocation",
    salary: "¥12,000,000 - ¥16,500,000",
    type: "Full-time",
    category: "AI & Data Science",
    experience: "Senior",
    description: "Lead the development of next-generation multimodal neural networks for precision medical robotics in Tokyo. Work alongside world-class computational biologists with state-of-the-art supercomputers.",
    requirements: [
      "Ph.D. in Computer Science, Machine Learning, or related field with publications at NeurIPS/ICML/CVPR.",
      "Expertise with PyTorch, JAX, and large-scale distributed model training.",
      "Demonstrated ability to write production-grade high-performance code in Python and C++."
    ],
    benefits: [
      "Complete visa sponsorship and renewal handling.",
      "Fully covered business-class airfare for family and pet relocation.",
      "Comprehensive Japanese National Health Insurance + Private Supplementary cover.",
      "Subsidized housing in central Tokyo (Roppongi or Shibuya district).",
      "Bilingual lifestyle coordinator to assist with housing and banking setup."
    ],
    techStack: ["PyTorch", "JAX", "C++", "CUDA", "Kubernetes", "Transformers"],
    growthTrend: "+24% YoY Talent Influx",
    visaDifficulty: "Low"
  },
  {
    id: "job-2",
    title: "Principal FinTech System Architect",
    company: "FlowNL Payments",
    logoBg: "bg-emerald-600",
    location: "Amsterdam, Netherlands",
    country: "Netherlands",
    visaStatus: "Full Sponsorship",
    relocationSupport: "Flights + Temp Housing",
    salary: "€95,000 - €125,000",
    type: "Full-time",
    category: "Software Engineering",
    experience: "Lead",
    description: "Design and implement ultra-low-latency transaction gateways compliant with European PSD3 security protocols. FlowNL powers decentralized micro-transactions for millions of European shoppers.",
    requirements: [
      "8+ years of distributed backend systems architecture using Go or Rust.",
      "In-depth knowledge of Event Sourcing, CQRS patterns, and Apache Kafka cluster tuning.",
      "Familiarity with EU financial regulatory frameworks (GDPR, PSD3)."
    ],
    benefits: [
      "Highly coveted 30% Ruling Tax Benefit application handling (allows 30% of salary tax-free).",
      "Full relocation flights + 4 weeks of premium temporary apartment housing in Amsterdam.",
      "Corporate-sponsored Dutch language courses and public transit card (OV-chipkaart).",
      "Generous stock option package + annual performance bonus."
    ],
    techStack: ["Go", "Rust", "Kafka", "PostgreSQL", "Docker", "gRPC"],
    growthTrend: "+18% FinTech Growth Index",
    visaDifficulty: "Low"
  },
  {
    id: "job-3",
    title: "International Lead Product Manager",
    company: "OmniSaaS Global",
    logoBg: "bg-purple-600",
    location: "London, United Kingdom",
    country: "United Kingdom",
    visaStatus: "Sponsorship Available",
    relocationSupport: "Flights + Temp Housing",
    salary: "£85,000 - £110,000",
    type: "Full-time",
    category: "Product Management",
    experience: "Lead",
    description: "Oversee the globalization and localization of OmniSaaS core cloud workspaces across the APAC and EMEA regions. Collaborate with regional leads to build intuitive and compliance-ready collaboration tools.",
    requirements: [
      "Track record of launching B2B SaaS products to international markets.",
      "Strong analytical mindset with proficiency in SQL, Amplitude, and user testing across multiple cultures.",
      "Exemplary communication skills with the ability to harmonize distributed cross-functional teams."
    ],
    benefits: [
      "Skilled Worker Visa (UK) sponsorship support.",
      "Comprehensive BUPA private medical and dental insurance.",
      "Annual flight allowance to visit your home country.",
      "Flexible hybrid model (2 days office, 3 days remote from anywhere in the UK)."
    ],
    techStack: ["SaaS Architecture", "Amplitude", "Jira", "Figma", "Mixpanel"],
    growthTrend: "+12% SaaS Adoption",
    visaDifficulty: "Medium"
  },
  {
    id: "job-4",
    title: "Lead Deep Learning Engineer",
    company: "Heidelberg Robotics",
    logoBg: "bg-sky-600",
    location: "Munich, Germany",
    country: "Germany",
    visaStatus: "Full Sponsorship",
    relocationSupport: "Full Relocation",
    salary: "€88,000 - €105,000",
    type: "Full-time",
    category: "AI & Data Science",
    experience: "Senior",
    description: "Implement edge computer vision neural networks for autonomous logistics vehicles. Optimize inference latency to run safely on low-power arm-based SOCs.",
    requirements: [
      "Solid foundation in mathematical optimization, linear algebra, and digital signal processing.",
      "3+ years of experience deploying TensorRT, OpenVINO, or ONNX models on edge hardware.",
      "Proficient in C++ and Python."
    ],
    benefits: [
      "German Blue Card visa processing with fast-track permanent residency options.",
      "Comprehensive relocation package including shipping container assistance.",
      "German language class subsidy.",
      "30 calendar days of paid vacation."
    ],
    techStack: ["TensorFlow", "TensorRT", "C++", "Docker", "ROS2", "Python"],
    growthTrend: "+30% Automation Sector",
    visaDifficulty: "Low"
  },
  {
    id: "job-5",
    title: "Global UX/UI Product Designer",
    company: "NeoSphere Web",
    logoBg: "bg-rose-600",
    location: "Singapore",
    country: "Singapore",
    visaStatus: "Sponsorship Available",
    relocationSupport: "None",
    salary: "S$110,000 - S$145,000",
    type: "Full-time",
    category: "Creative & Design",
    experience: "Senior",
    description: "Champion the design of highly immersive, glassmorphic interfaces for our global cryptocurrency and asset management dashboard. Bring complex financial transactions into clear, accessible visual hierarchies.",
    requirements: [
      "Stunning portfolio showcasing responsive web interfaces with custom micro-animations and layouts.",
      "Proficiency in Figma, Framer, and basic understanding of React/Tailwind code structures.",
      "Experience with localization frameworks and accessibility guidelines (WCAG 2.1)."
    ],
    benefits: [
      "Employment Pass (EP) sponsorship and processing coordination.",
      "High-end corporate laptop and visual equipment allowance.",
      "Central Singapore prime office with catered meals.",
      "Health and wellness credits (gym memberships, mental wellness apps)."
    ],
    techStack: ["Figma", "Framer", "React", "CSS Grid", "Aesthetics", "Design Systems"],
    growthTrend: "+14% Design Innovation",
    visaDifficulty: "High"
  },
  {
    id: "job-6",
    title: "Staff Devops & Cloud Architect",
    company: "Helvetic Cloud AG",
    logoBg: "bg-amber-600",
    location: "Zurich, Switzerland",
    country: "Switzerland",
    visaStatus: "No Sponsorship",
    relocationSupport: "None",
    salary: "CHF 130,000 - CHF 165,000",
    type: "Full-time",
    category: "Software Engineering",
    experience: "Lead",
    description: "Manage Swiss-sovereign multi-cloud infrastructure handling highly confidential healthcare records. Automate strict compliance auditing using infrastructure-as-code.",
    requirements: [
      "Swiss/EU Citizenship or valid Swiss C-permit required.",
      "Exceptional mastery over Terraform, AWS/Azure, and container orchestration at scale.",
      "Expertise in Zero Trust architecture, private DNS networks, and encryption at rest/in transit."
    ],
    benefits: [
      "Unparalleled Swiss corporate pension matching program.",
      "Top-tier private health plan option subsidies.",
      "Ski pass discount cards and team retreats in Saint Moritz.",
      "Generous child support and family allowance benefits."
    ],
    techStack: ["Terraform", "AWS", "Kubernetes", "Zero Trust", "Envoy", "Python"],
    growthTrend: "+8% Enterprise Cloud",
    visaDifficulty: "High"
  },
  {
    id: "job-7",
    title: "Senior Full-Stack AI Engineer",
    company: "Pacific Frontier",
    logoBg: "bg-blue-600",
    location: "Vancouver, Canada",
    country: "Canada",
    visaStatus: "Full Sponsorship",
    relocationSupport: "Flights + Temp Housing",
    salary: "C$130,000 - C$160,000",
    type: "Full-time",
    category: "Software Engineering",
    experience: "Senior",
    description: "Build beautiful web interfaces coupled with powerful, server-side LLM orchestration for enterprise knowledge mapping. Focus on real-time collaborations and clean data pipelines.",
    requirements: [
      "Strong skills in TypeScript, React, Next.js, and Node.js.",
      "Hands-on experience with Vector databases (Pinecone, pgvector) and LangChain or Semantic Kernel.",
      "Passion for building sleek, highly functional dashboards with seamless animations."
    ],
    benefits: [
      "Full Express Entry / BC PNP sponsorship and permanent residency support.",
      "Dental, Vision, and Medical insurance from day one.",
      "RRSP pension matching program up to 5%.",
      "Flexible budget for home office hardware + high-speed fiber internet subsidy."
    ],
    techStack: ["React", "TypeScript", "Node.js", "Express", "Pinecone", "Tailwind CSS"],
    growthTrend: "+21% AI Web Integration",
    visaDifficulty: "Low"
  }
];
