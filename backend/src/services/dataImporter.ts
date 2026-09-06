import fs from 'fs';
import path from 'path';
import { Job, WorkType, EmploymentType } from '../types';
import { db } from '../database/db';

const KNOWN_SKILLS_DICTIONARY = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'Golang', 'Rust',
  'Java', 'C++', 'C#', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
  'REST APIs', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'CI/CD',
  'GitHub Actions', 'Linux', 'Microservices', 'PyTorch', 'TensorFlow', 'LLMs',
  'LangChain', 'Hugging Face', 'Machine Learning', 'Data Science', 'Data Engineering',
  'Spark', 'Kafka', 'Snowflake', 'dbt', 'Airflow', 'BigQuery', 'Next.js', 'Tailwind CSS',
  'HTML5', 'CSS3', 'Redux', 'Jest', 'Playwright', 'Cypress', 'Selenium', 'Swift',
  'SwiftUI', 'Kotlin', 'Jetpack Compose', 'React Native', 'Cybersecurity', 'SOC 2',
  'OAuth', 'Penetration Testing', 'SIEM', 'Figma', 'UI/UX Design', 'Design Systems',
  'Product Strategy', 'Agile', 'Scrum', 'A/B Testing', 'System Design'
];

export function parseCSV(content: string): Array<Record<string, string>> {
  const rows: Array<Record<string, string>> = [];
  const lines: string[] = [];
  
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else if (char === '\r' && !inQuotes) {
      // skip carriage return
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  // Parse header
  const headers = splitCSVLine(lines[0]);

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = splitCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] !== undefined ? values[j] : '';
    }
    rows.push(row);
  }

  return rows;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function extractSkillsFromText(text: string, title: string): string[] {
  const found = new Set<string>();
  const combined = `${title} ${text}`.toLowerCase();

  for (const skill of KNOWN_SKILLS_DICTIONARY) {
    const regex = new RegExp(`\\b${skill.toLowerCase().replace('+', '\\+')}\\b`, 'i');
    if (regex.test(combined)) {
      found.add(skill);
    }
  }

  if (found.size === 0) {
    found.add('Software Engineering');
    found.add('Problem Solving');
  }

  return Array.from(found);
}

export function extractExperienceRequirements(text: string): string | undefined {
  const match = text.match(/(\d+\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?))/i);
  if (match) {
    return `${match[1]} of relevant experience`;
  }
  if (/senior|lead|staff|principal/i.test(text)) {
    return '5+ years of relevant experience';
  }
  if (/junior|associate|entry/i.test(text)) {
    return '0-2 years of experience';
  }
  return '2-4 years of experience';
}

export function extractEducationRequirements(text: string): string | undefined {
  if (/master|phd|doctorate/i.test(text)) {
    return "Bachelor's or Master's in Computer Science or related STEM field";
  }
  if (/bachelor|degree|bs|ba/i.test(text)) {
    return "Bachelor's degree in Computer Science, Engineering, or equivalent experience";
  }
  return "Degree or equivalent practical experience";
}

export function extractSalary(title: string, exp: string | undefined): { min: number; max: number; currency: string } {
  let min = 110000;
  let max = 160000;

  const t = title.toLowerCase();
  if (t.includes('principal') || t.includes('staff') || t.includes('architect')) {
    min = 190000;
    max = 260000;
  } else if (t.includes('senior') || t.includes('lead')) {
    min = 150000;
    max = 210000;
  } else if (t.includes('junior') || t.includes('entry') || t.includes('associate')) {
    min = 85000;
    max = 120000;
  } else if (t.includes('machine learning') || t.includes('ai ') || t.includes('security')) {
    min = 140000;
    max = 200000;
  }

  return { min, max, currency: 'USD' };
}

export function importJobsFromCSV(csvFilePath?: string): {
  totalRows: number;
  imported: number;
  skipped: number;
  duplicates: number;
} {
  const filePath = csvFilePath || path.join(process.cwd(), 'data', 'clean_jobs.csv');

  if (!fs.existsSync(filePath)) {
    console.warn(`CSV file not found at ${filePath}. Will initialize empty jobs.`);
    return { totalRows: 0, imported: 0, skipped: 0, duplicates: 0 };
  }

  const rawContent = fs.readFileSync(filePath, 'utf8');
  const rawRows = parseCSV(rawContent);

  const existingIds = new Set(db.jobs.map(j => j.id));
  const importedJobs: Job[] = [...db.jobs];
  let importedCount = 0;
  let skippedCount = 0;
  let duplicateCount = 0;

  const now = new Date().toISOString();

  for (const row of rawRows) {
    const id = (row.id || '').trim();
    const title = (row.title || '').trim();
    const company = (row.company || '').trim();
    const description = (row.description || '').trim();

    if (!id || !title || !company || !description) {
      skippedCount++;
      continue;
    }

    if (existingIds.has(id)) {
      duplicateCount++;
      continue;
    }

    const location = (row.location || 'Remote').trim();
    const link = (row.link || '').trim();
    const source = (row.source || 'Direct').trim();
    const datePosted = (row.date_posted || now.split('T')[0]).trim();
    const workType: WorkType = (row.work_type === 'Hybrid' || row.work_type === 'On-site' ? row.work_type : 'Remote');
    const employmentType: EmploymentType = (
      row.employment_type === 'Contract' || row.employment_type === 'Part-time' || row.employment_type === 'Internship' 
        ? row.employment_type 
        : 'Full-time'
    );

    const extractedSkills = extractSkillsFromText(description, title);
    const experienceRequirements = extractExperienceRequirements(description);
    const educationRequirements = extractEducationRequirements(description);
    const salary = extractSalary(title, experienceRequirements);

    const keywords = Array.from(new Set([
      ...extractedSkills.map(s => s.toLowerCase()),
      ...title.toLowerCase().split(/\s+/).filter(w => w.length > 2),
      company.toLowerCase(),
      workType.toLowerCase(),
      employmentType.toLowerCase()
    ]));

    const t = title.toLowerCase();
    const c = company.toLowerCase();
    
    // Determine Company Type based on company name/keywords
    let companyType: 'MNC' | 'Startup' | 'Newly Founded' | 'Enterprise' = 'Startup';
    const mncNames = ['google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'adobe', 'salesforce', 'oracle', 'ibm', 'cisco', 'intel', 'sap', 'uber', 'airbnb', 'stripe', 'spotify'];
    const newlyFoundedKeywords = ['stealth', 'labs', 'ai', 'technologies', 'robotics', 'nextgen', 'proto', 'seed'];
    
    if (mncNames.some(m => c.includes(m))) {
      companyType = 'MNC';
    } else if (newlyFoundedKeywords.some(k => c.includes(k)) || Math.random() < 0.25) {
      companyType = 'Newly Founded';
    } else if (Math.random() < 0.35) {
      companyType = 'MNC';
    } else {
      companyType = 'Startup';
    }

    // Determine Experience Level
    let experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Internship' = 'Mid';
    if (employmentType === 'Internship') {
      experienceLevel = 'Internship';
    } else if (t.includes('junior') || t.includes('entry') || t.includes('associate') || t.includes('fresher') || t.includes('graduate')) {
      experienceLevel = 'Entry';
    } else if (t.includes('senior') || t.includes('sr.')) {
      experienceLevel = 'Senior';
    } else if (t.includes('lead') || t.includes('principal') || t.includes('staff') || t.includes('director') || t.includes('head')) {
      experienceLevel = 'Lead';
    }

    const isFresherFriendly = experienceLevel === 'Entry' || experienceLevel === 'Internship' || (experienceRequirements?.includes('0-') || experienceRequirements?.includes('0 to') || experienceRequirements?.includes('0-2'));

    // Dynamic Applicant & Competition Simulation for realism
    // Seeded deterministically based on ID hash so values stay stable
    const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const applicantsCount = (hash % 75) + 3; // 3 to 77 applicants
    const isEarlyApplicant = applicantsCount < 15;
    const competitionLevel = applicantsCount < 15 ? 'Low' : applicantsCount <= 45 ? 'Medium' : 'High';

    // Posted time relative indicator
    const hoursAgo = (hash % 72) + 1;
    let postedTimeAgo = `${hoursAgo}h ago`;
    if (hoursAgo < 1) postedTimeAgo = '15m ago';
    else if (hoursAgo > 24) postedTimeAgo = `${Math.floor(hoursAgo / 24)}d ago`;
    const isFresh = hoursAgo <= 24;

    const job: Job = {
      id,
      title,
      company,
      location,
      link,
      source,
      datePosted,
      workType,
      employmentType,
      companyType,
      description,
      salaryMin: salary.min,
      salaryMax: salary.max,
      salaryCurrency: salary.currency,
      extractedSkills,
      experienceRequirements,
      educationRequirements,
      experienceLevel,
      normalizedTitle: title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(),
      normalizedCompany: company.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(),
      normalizedLocation: location.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(),
      keywords,
      applicantsCount,
      competitionLevel,
      isEarlyApplicant,
      isFresherFriendly,
      postedTimeAgo,
      isFresh,
      createdAt: now,
      updatedAt: now
    };

    importedJobs.push(job);
    existingIds.add(id);
    importedCount++;
  }

  db.setJobs(importedJobs);

  console.log(`[Job Ingestion Pipeline] Processed ${rawRows.length} rows: ${importedCount} imported, ${duplicateCount} duplicates, ${skippedCount} skipped.`);

  return {
    totalRows: rawRows.length,
    imported: importedCount,
    skipped: skippedCount,
    duplicates: duplicateCount
  };
}
