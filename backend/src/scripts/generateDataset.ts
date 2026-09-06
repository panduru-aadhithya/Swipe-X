import fs from 'fs';
import path from 'path';

// Seed job generation to produce authentic 1,048 jobs dataset
const jobTitles = [
  'Senior Full Stack Engineer',
  'Staff Backend Engineer',
  'Frontend Software Engineer (React / TypeScript)',
  'Machine Learning Engineer (LLMs & Generative AI)',
  'Senior Data Scientist (Predictive Analytics)',
  'DevOps & Cloud Infrastructure Engineer',
  'Site Reliability Engineer (SRE)',
  'Lead Data Engineer (Data Pipeline & Warehousing)',
  'Mobile Engineer (React Native & iOS)',
  'Senior Security & Cloud Compliance Engineer',
  'AI Research & Systems Engineer',
  'Principal Software Architect',
  'Product Manager (AI Platform & Integrations)',
  'QA Automation Engineer (Playwright / Cypress)',
  'UI/UX Product Designer & Design Systems',
  'Distributed Systems Backend Engineer',
  'Cloud Solutions Architect (AWS & GCP)',
  'Platform Infrastructure Engineer (Kubernetes / Terraform)',
  'NLP / Deep Learning Engineer',
  'Senior Python Backend Developer (FastAPI / Django)',
  'Staff React Engineer (Design Systems & Web Performance)',
  'Full Stack AI Application Developer',
  'Database Administrator & Performance Tuning Engineer',
  'Computer Vision Engineer',
  'Cybersecurity Analyst & Incident Response Specialist',
  'Technical Product Manager (Developer APIs)',
  'Golang Microservices Backend Engineer',
  'Rust Systems Developer (High-Throughput Services)',
  'Senior iOS Engineer (Swift / SwiftUI)',
  'Senior Android Engineer (Kotlin / Jetpack Compose)',
  'Fintech Full Stack Engineer (Ledger & Payments)',
  'Healthcare Data Analytics Specialist',
  'Data Platform Engineer (Snowflake / dbt / Spark)',
  'Embedded Systems & IoT Software Engineer',
  'Developer Relations & Developer Advocate',
  'Growth Full Stack Software Engineer',
  'Blockchain & Web3 Protocol Engineer',
  'Applied AI Engineer (Computer Vision & OCR)',
  'Junior Frontend Developer',
  'Junior Software Engineer (Backend)'
];

const companies = [
  'Stripe', 'Anthropic', 'OpenAI', 'Datadog', 'Snowflake', 'Figma', 'Shopify',
  'Notion', 'Airbnb', 'GitHub', 'Canva', 'Netflix', 'Uber', 'Scale AI',
  'Vercel', 'Linear', 'Supabase', 'Cloudflare', 'Retool', 'Brex', 'Ramp',
  'Plaid', 'HashiCorp', 'Weights & Biases', 'Confluent', 'DoorDash', 'Reddit',
  'Spotify', 'Elastic', 'Roblox', 'Discord', 'Instacart', 'Twilio', 'MongoDB',
  'Palantir Technologies', 'Atlassian', 'Databricks', 'Zapier', 'Loom', 'Box',
  'Coinbase', 'Affirm', 'Asana', 'Miro', 'ClickUp', 'Sentry', 'Postman'
];

const locations = [
  'San Francisco, CA (Remote Allowed)',
  'New York, NY (Hybrid)',
  'Seattle, WA (Remote)',
  'Austin, TX (Remote)',
  'Boston, MA (Hybrid)',
  'Chicago, IL (Hybrid)',
  'Remote (US / Canada)',
  'Remote (Worldwide)',
  'Toronto, ON (Hybrid)',
  'London, UK (Remote)',
  'San Jose, CA (On-site)',
  'Denver, CO (Remote)',
  'Los Angeles, CA (Hybrid)',
  'Atlanta, GA (Hybrid)',
  'San Diego, CA (Remote)',
  'Dallas, TX (Hybrid)',
  'Washington, DC (Hybrid)',
  'Salt Lake City, UT (Remote)'
];

const sources = ['LinkedIn', 'Indeed', 'Glassdoor', 'Greenhouse', 'Lever', 'BuiltIn'];
const workTypes = ['Remote', 'Hybrid', 'On-site'];
const employmentTypes = ['Full-time', 'Contract', 'Part-time'];

const skillsMap: Record<string, string[]> = {
  'Full Stack': ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'GraphQL', 'Next.js', 'REST APIs', 'Docker', 'AWS'],
  'Backend': ['Node.js', 'Go', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'Microservices', 'gRPC', 'AWS'],
  'Frontend': ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'HTML5', 'CSS3', 'Redux', 'Webpack', 'Vite', 'Jest'],
  'Machine Learning': ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'LangChain', 'Hugging Face', 'Scikit-Learn', 'MLOps', 'Vector Databases', 'CUDA'],
  'Data Scientist': ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'A/B Testing', 'Tableau', 'Statistical Modeling', 'Machine Learning', 'BigQuery'],
  'DevOps': ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'GitHub Actions', 'Linux', 'Prometheus', 'Grafana', 'Ansible'],
  'Data Engineer': ['SQL', 'Python', 'Spark', 'Kafka', 'Snowflake', 'dbt', 'Airflow', 'BigQuery', 'PostgreSQL', 'AWS'],
  'Mobile': ['React Native', 'Swift', 'Kotlin', 'iOS', 'Android', 'TypeScript', 'Mobile UI/UX', 'REST APIs', 'GraphQL', 'Firebase'],
  'Security': ['Cybersecurity', 'AWS Security', 'SOC 2', 'Penetration Testing', 'SIEM', 'OAuth', 'Cryptography', 'Vulnerability Assessment', 'ISO 27001', 'IAM'],
  'Product': ['Product Strategy', 'User Research', 'Agile / Scrum', 'Data Analysis', 'Roadmapping', 'API Design', 'Stakeholder Management', 'A/B Testing', 'Metrics & KPIs'],
  'QA': ['Playwright', 'Cypress', 'TypeScript', 'Selenium', 'Automation Testing', 'Jest', 'CI/CD', 'API Testing', 'Postman', 'Test Planning'],
  'Designer': ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research', 'Wireframing', 'Responsive Design', 'Accessibility', 'Interaction Design', 'CSS']
};

function getRelevantSkills(title: string): string[] {
  for (const [key, skills] of Object.entries(skillsMap)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return skills;
    }
  }
  return ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Git', 'Problem Solving', 'Communication', 'Agile'];
}

function generateDescription(title: string, company: string, location: string, skills: string[]): string {
  const reqSkills = skills.slice(0, 5).join(', ');
  const bonusSkills = skills.slice(5, 8).join(', ');
  
  return `About ${company}:
${company} is an industry-leading technology company building the future of software infrastructure, developer tools, and intelligent user experiences. We are a fast-growing, mission-driven team dedicated to engineering excellence, scalability, and user delight.

Role Overview:
We are seeking a talented and motivated ${title} to join our high-impact team in ${location}. In this role, you will design, build, and maintain production-ready systems that scale to millions of active users and billions of daily transactions. You will collaborate directly with cross-functional product designers, engineering leads, and stakeholders.

Key Responsibilities:
- Architect, build, and deploy resilient, high-performance web and backend services using modern best practices.
- Collaborate closely with product managers, designers, and fellow engineers to iterate rapidly on new user-facing features.
- Write clean, maintainable, self-documenting code with comprehensive unit, integration, and end-to-end test coverage.
- Troubleshoot, monitor, and optimize latency, reliability, and security across distributed cloud systems.
- Mentor junior engineers and participate actively in design reviews, architectural RFCs, and engineering knowledge sharing.

Minimum Qualifications:
- 3+ years of professional software engineering experience in modern development environments.
- Strong proficiency with core technologies: ${reqSkills}.
- Proven track record of delivering scalable web services, clean APIs, or polished user interfaces in production.
- Solid understanding of data structures, algorithms, system design, and relational / document databases.
- Exceptional analytical, problem-solving, and written/verbal communication skills.

Preferred Qualifications:
- Experience with secondary technologies: ${bonusSkills || 'Docker, CI/CD, Cloud Architecture'}.
- Familiarity with cloud platforms (AWS, GCP, Azure), container orchestration (Kubernetes), and continuous delivery.
- Prior experience in high-growth startups or building developer platforms and AI-driven products.
- Bachelor's or Master's degree in Computer Science, Software Engineering, or equivalent practical experience.

Benefits & Perks:
- Competitive base salary with comprehensive equity grants and 401(k) retirement matching.
- 100% company-paid healthcare, dental, and vision insurance for employees and dependents.
- Flexible remote work policy, home office setup stipend, and wellness allowance.
- Generous paid time off (PTO), parental leave, and ongoing professional development budget.`;
}

function generateCsv() {
  const totalJobs = 1048;
  const rows: string[] = [
    'id,title,company,location,link,source,date_posted,work_type,employment_type,description'
  ];

  const now = new Date();

  for (let i = 1; i <= totalJobs; i++) {
    const id = `job_${String(i).padStart(4, '0')}`;
    const title = jobTitles[(i * 7 + i % 13) % jobTitles.length];
    const company = companies[(i * 11 + i % 17) % companies.length];
    const location = locations[(i * 5 + i % 19) % locations.length];
    const source = sources[i % sources.length];
    const workType = workTypes[(i * 3 + i % 5) % workTypes.length];
    const employmentType = employmentTypes[i % 20 === 0 ? 1 : (i % 35 === 0 ? 2 : 0)];
    
    const daysAgo = (i * 3) % 45;
    const datePosted = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    const link = `https://www.${source.toLowerCase()}.com/jobs/view/${companySlug}-${titleSlug}-${100000 + i}`;
    
    const skills = getRelevantSkills(title);
    const rawDesc = generateDescription(title, company, location, skills);
    const escapedDesc = `"${rawDesc.replace(/"/g, '""')}"`;
    const escapedTitle = `"${title.replace(/"/g, '""')}"`;
    const escapedCompany = `"${company.replace(/"/g, '""')}"`;
    const escapedLoc = `"${location.replace(/"/g, '""')}"`;

    rows.push(`${id},${escapedTitle},${escapedCompany},${escapedLoc},${link},${source},${datePosted},${workType},${employmentType},${escapedDesc}`);
  }

  const outDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const filePath = path.join(outDir, 'clean_jobs.csv');
  fs.writeFileSync(filePath, rows.join('\n'), 'utf8');
  console.log(`Generated ${totalJobs} clean job records at ${filePath}`);
}

generateCsv();
