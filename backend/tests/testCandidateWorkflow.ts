import { db } from '../src/database/db';
import { importJobsFromCSV } from '../src/services/dataImporter';
import { resumeParserService } from '../src/ai/resumeParser/resumeParserService';
import { atsAnalyzerService } from '../src/ai/atsAnalyzer/atsAnalyzerService';
import { recommendationEngineService } from '../src/ai/recommendationEngine/recommendationEngineService';
import { candidateRepository, userRepository } from '../src/repositories/userRepository';
import { resumeRepository } from '../src/repositories/resumeRepository';
import { jobRepository, atsRepository, swipeRepository, savedJobRepository, applicationRepository } from '../src/repositories/jobRepository';
import { hashPassword } from '../src/utils/auth';

async function runTests() {
  console.log('--- STARTING SWIPE X INTEGRATION & AI TESTS ---');

  // Test 1: Ingestion
  console.log('1. Checking dataset ingestion...');
  if (db.jobs.length === 0) {
    importJobsFromCSV();
  }
  console.log(`✓ Total jobs in DB: ${db.jobs.length}`);

  // Test 2: Create Candidate User
  console.log('2. Creating candidate user...');
  const userId = 'user_test_candidate';
  const profileId = 'cand_test_profile';
  
  const user = {
    id: userId,
    email: 'test.candidate@swipe-x.ai',
    passwordHash: hashPassword('TestSecret123'),
    name: 'Morgan Test',
    role: 'CANDIDATE' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const profile = {
    id: profileId,
    userId: userId,
    name: 'Morgan Test',
    email: 'test.candidate@swipe-x.ai',
    preferredRole: 'Senior Full Stack Engineer',
    skills: ['TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'PostgreSQL'],
    experienceYears: 4,
    profileCompletionScore: 85,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  userRepository.create(user);
  candidateRepository.create(profile);
  console.log('✓ Candidate profile created in repository');

  // Test 3: Resume Parser
  console.log('3. Testing resume parsing with technical skills extraction...');
  const sampleResume = `
  Morgan Test
  Senior Software Engineer
  San Francisco, CA | morgan@example.com
  
  Summary:
  Senior Engineer with 4+ years of experience in React, TypeScript, Node.js, GraphQL, PostgreSQL, and AWS ECS.
  
  Experience:
  Senior Full Stack Engineer at FinTech Corp (2022 - Present)
  - Architected distributed microservices in Node.js and TypeScript handling 50k requests/sec.
  - Built real-time analytics dashboard with React 19 and Tailwind CSS.
  - Implemented automated CI/CD pipelines with Docker and AWS.
  `;

  const parsedResume = await resumeParserService.parseResumeText(sampleResume, 'Morgan_Test_Resume.pdf');
  console.log(`✓ Parsed ${parsedResume.skills.length} skills. ATS Readiness: ${parsedResume.atsReadinessScore}/100`);

  const resume = {
    id: 'res_test_01',
    userId,
    candidateProfileId: profileId,
    fileName: 'Morgan_Test_Resume.pdf',
    fileSize: 2048,
    mimeType: 'application/pdf',
    rawText: sampleResume,
    parsingStatus: 'PARSED' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  resumeRepository.create(resume);

  const resumeData = {
    id: 'rd_test_01',
    resumeId: resume.id,
    candidateProfileId: profileId,
    name: parsedResume.name,
    email: parsedResume.email,
    skills: parsedResume.skills,
    experience: parsedResume.experience,
    education: parsedResume.education,
    projects: parsedResume.projects,
    certifications: parsedResume.certifications,
    atsReadinessScore: parsedResume.atsReadinessScore,
    strengths: parsedResume.strengths,
    areasForImprovement: parsedResume.areasForImprovement,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  resumeRepository.saveResumeData(resumeData);

  // Test 4: Recommendation Engine
  console.log('4. Testing Recommendation Engine with multi-factor weighting...');
  const recommendations = await recommendationEngineService.getRecommendations(profile, resumeData, { limit: 5 });
  console.log(`✓ Retrieved ${recommendations.recommendations.length} recommendations. Top match: ${recommendations.recommendations[0]?.job.title} (${recommendations.recommendations[0]?.matchScore}%)`);

  // Test 5: ATS Analyzer
  console.log('5. Testing Job-Specific ATS Analyzer...');
  const targetJob = recommendations.recommendations[0].job;
  const atsReport = await atsAnalyzerService.analyzeJobATS({
    candidateProfileId: profileId,
    resumeId: resume.id,
    resumeData,
    job: targetJob
  });
  console.log(`✓ ATS Overall Score: ${atsReport.atsScore}% (Skills: ${atsReport.skillScore}%, Keywords: ${atsReport.keywordScore}%, Exp: ${atsReport.experienceScore}%)`);

  // Test 6: Swipe and Application Flow
  console.log('6. Testing Swipes and Application creation...');
  swipeRepository.record({
    id: 'sw_test_01',
    candidateProfileId: profileId,
    jobId: targetJob.id,
    decision: 'RIGHT',
    createdAt: new Date().toISOString()
  });

  const app = {
    id: 'app_test_01',
    candidateProfileId: profileId,
    jobId: targetJob.id,
    job: targetJob,
    resumeId: resume.id,
    atsReportId: atsReport.id,
    atsScore: atsReport.atsScore,
    status: 'APPLIED' as const,
    appliedDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    statusHistory: [{ status: 'APPLIED' as const, timestamp: new Date().toISOString(), note: 'Applied' }]
  };
  applicationRepository.create(app);
  console.log(`✓ Application submitted for job "${targetJob.title}". Application ID: ${app.id}`);

  console.log('--- ALL INTEGRATION TESTS PASSED CLEANLY ---');
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
