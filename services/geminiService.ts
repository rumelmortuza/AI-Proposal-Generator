import { GoogleGenAI, Type } from "@google/genai";
import type { FormState, ProposalData } from "../types";

// Fix: Initialize GoogleGenAI with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const PROPOSAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Catchy title for the proposal." },
    projectName: { type: Type.STRING, description: "The name of the project, extracted from the reference document." },
    clientName: { type: Type.STRING, description: "The name of the client, extracted from the reference document." },
    introduction: { type: Type.STRING, description: "A compelling introduction. Should be a few paragraphs. Use markdown." },
    problemStatement: { type: Type.STRING, description: "A clear description of the client's problem, based on the reference document. Use markdown." },
    proposedSolution: { type: Type.STRING, description: "A detailed description of the proposed solution. This section is the core of the proposal and MUST be a comprehensive, practical elaboration of the methodology extracted from the provided Terms of Reference document. It should explain step-by-step HOW the project will be executed based on the client's specified approach. Use markdown." },
    scopeOfWork: { type: Type.STRING, description: "A breakdown of the work, deliverables, and milestones. This section MUST be structured entirely around the methodology detailed in the 'Proposed Solution'. Every item listed here must directly correspond to the processes from the Terms of Reference document. Use a markdown list." },
    teamIntroduction: { type: Type.STRING, description: "An introduction to the team, highlighting relevant experience. Use markdown." },
    caseStudies: { type: Type.STRING, description: "A relevant case study or client testimonial. Use markdown." },
    timeline: { type: Type.STRING, description: "An estimated project timeline. Use a markdown list with phases and durations." },
    budget: {
      type: Type.OBJECT,
      properties: {
        breakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              cost: { type: Type.NUMBER },
            },
            required: ["item", "cost"],
          },
        },
        total: { type: Type.NUMBER, description: "The total cost of the project. Must be the sum of all items in the breakdown." },
      },
      required: ["breakdown", "total"],
    },
    nextSteps: { type: Type.STRING, description: "Clear next steps for the client. Use a markdown list." },
    conclusion: { type: Type.STRING, description: "A strong concluding statement. Should be a few paragraphs. Use markdown." },
  },
  required: [
    "title", "projectName", "clientName", "introduction", "problemStatement",
    "proposedSolution", "scopeOfWork", "teamIntroduction", "caseStudies",
    "timeline", "budget", "nextSteps", "conclusion",
  ],
};

const TEMPLATE_INSTRUCTIONS: { [key: string]: string } = {
  'Software Development': `
    **Template Guidance: Software Development**
    - Structure the proposal with a focus on software development methodologies (e.g., Agile, Scrum).
    - Emphasize technical aspects in the 'Proposed Solution' like technology stack, architecture, and development phases (e.g., discovery, design, development, testing, deployment).
    - The 'Scope of Work' should be broken down into sprints, user stories, or specific technical deliverables.
    - The 'Timeline' should reflect development sprints and key milestones.`,
  'Marketing Campaign': `
    **Template Guidance: Marketing Campaign**
    - The 'Proposed Solution' should detail the campaign strategy, target audience, key messaging, and channels (e.g., social media, SEO, email marketing).
    - The 'Scope of Work' must list specific marketing activities and deliverables, such as content creation, ad setup, and performance reporting.
    - Define clear Key Performance Indicators (KPIs) and success metrics within the proposal.
    - The 'Budget' should be broken down by channel or activity (e.g., ad spend, content creation costs).`,
  'Consulting Services': `
    **Template Guidance: Consulting Services**
    - The 'Proposed Solution' must clearly outline your consulting methodology, frameworks, and diagnostic process.
    - The 'Scope of Work' should detail phases of the consulting engagement, such as data collection, analysis, recommendation, and implementation support.
    - Emphasize the expertise and experience of the team.
    - Focus on the expected outcomes and value delivered to the client.`,
  'Creative Services': `
    **Template Guidance: Creative Services**
    - The 'Proposed Solution' should describe the creative process, from concept and mood boards to final execution.
    - The 'Scope of Work' should include deliverables like brand guidelines, logo variations, number of design revisions, and final asset formats.
    - The proposal should have a visually appealing tone and language.
    - Include links to a portfolio or relevant case studies if available in the provided text.`,
  'General Business': '', // No special instructions
};

export const generateProposal = async (formData: FormState): Promise<ProposalData> => {
  if (!formData.existingProposal) {
    throw new Error("A Terms of Reference document is required to generate a proposal.");
  }
  
  const model = 'gemini-2.5-pro';
  const templateInstruction = TEMPLATE_INSTRUCTIONS[formData.template] || '';
  const parts: any[] = [];
  
  let promptText = `Generate a comprehensive and professional project proposal. The output must be a valid JSON object that adheres to the provided schema.

  ${templateInstruction}

  **Primary Task & Source of Truth:**
  - **Thoroughly analyze the attached reference document (ToR, RFP, or brief).** This document is the most important source of information.
  - From this document, you **MUST** extract the following key details to build the proposal:
      - **Client Name:** The name of the organization requesting the proposal.
      - **Project Name:** The official name or title of the project.
      - **Problem Statement / Project Goals:** The core problem the client is trying to solve.
      - **Scope of Work & Deliverables:** The specific requirements, tasks, and expected outputs.

  **Crucial Focus: Methodology is Paramount**
  - **This is your most important directive.** The success of this proposal hinges on accurately and comprehensively detailing the methodology outlined in the client's attached Terms of Reference (ToR).
  - Your primary function is to **extract and then elaborate on the specific methods, processes, and steps described in the ToR.** Go beyond simple extraction; you must expand on these points, explaining how they will be implemented in practice.
  - The **'Proposed Solution'** section MUST be built entirely around the methodology from the ToR. It should read as a practical, step-by-step guide to executing the project according to the client's specified approach.
  - The **'Scope of Work'** section MUST directly correspond to the methodology. Each task and deliverable should be a logical outcome of the steps outlined in the 'Proposed Solution'.
  - **Do not invent a new methodology.** Your role is to demonstrate a deep understanding of the client's requirements by detailing *their* requested approach. This is non-negotiable.

  **Proposal Generation Instructions:**
  - The generated proposal sections (especially 'problemStatement', 'proposedSolution', and 'scopeOfWork') **MUST** directly address and elaborate on the details found in the reference document.

  **Supplementary Information (to be woven into the proposal):**
  - Our Company Info: ${formData.companyInfo || 'Not provided. Briefly introduce us as a capable and professional service provider.'}
  - Our Team Info: ${formData.teamInfo || 'Not provided. Mention a skilled team is ready to execute the project.'}
  - Our Case Studies/Testimonials: ${formData.caseStudies || 'Not provided. If not provided, you can omit the case studies section or create a brief, generic placeholder.'}

  **Logistical Details:**
  - Estimated Timeline: ${formData.timeline}
  - Estimated Budget: ${formData.budget}
  
  Use markdown for formatting within the string fields where appropriate (e.g., for lists, bolding).
  `;
  
  const fileData = await fileToBase64(formData.existingProposal);
  parts.push({
    inlineData: {
      mimeType: formData.existingProposal.type,
      data: fileData,
    },
  });

  parts.unshift({ text: promptText });

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: PROPOSAL_SCHEMA,
      temperature: 0.5,
    },
  });

  try {
    const jsonText = response.text.trim();
    const proposal = JSON.parse(jsonText);
    return proposal;
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("The AI returned an invalid response. Please try again.");
  }
};