export interface BudgetItem {
  item: string;
  cost: number;
}

export interface Budget {
  breakdown: BudgetItem[];
  total: number;
}

export interface ProposalData {
  title: string;
  projectName: string;
  clientName: string;
  introduction: string;
  problemStatement: string;
  proposedSolution: string;
  scopeOfWork: string;
  teamIntroduction: string;
  caseStudies: string;
  timeline: string;
  budget: Budget;
  nextSteps: string;
  conclusion: string;
}

export interface FormState {
  template: string;
  companyInfo: string;
  teamInfo: string;
  caseStudies: string;
  timeline: string;
  budget: string;
  existingProposal: File | null;
}