import React, { useState, useRef, DragEvent, FC, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { FormState } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';
import SparkleIcon from './icons/SparkleIcon';
import UploadIcon from './icons/UploadIcon';
import FileIcon from './icons/FileIcon';
import TrashIcon from './icons/TrashIcon';
import CodeIcon from './icons/CodeIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import ConsultingIcon from './icons/ConsultingIcon';
import CreativeIcon from './icons/CreativeIcon';
import CheckIcon from './icons/CheckIcon';

interface ProposalFormProps {
  onSubmit: (formData: FormState) => void;
  isLoading: boolean;
}

const InputField: FC<InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, name, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      id={name}
      name={name}
      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      {...props}
    />
  </div>
);

const TextareaField: FC<TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; description?: string }> = ({ label, name, description, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
    {description && <p className="text-sm text-slate-500 mb-1">{description}</p>}
    <textarea
      id={name}
      name={name}
      rows={4}
      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      {...props}
    />
  </div>
);

const templates = [
  {
    id: 'General Business',
    title: 'General Business',
    description: 'A versatile template for standard business proposals.',
    icon: (props: any) => <FileIcon {...props} />,
  },
  {
    id: 'Software Development',
    title: 'Software Development',
    description: 'Tailored for technical projects, sprints, and deliverables.',
    icon: (props: any) => <CodeIcon {...props} />,
  },
  {
    id: 'Marketing Campaign',
    title: 'Marketing Campaign',
    description: 'Focuses on campaign goals, KPIs, and channel strategy.',
    icon: (props: any) => <MegaphoneIcon {...props} />,
  },
  {
    id: 'Consulting Services',
    title: 'Consulting',
    description: 'Highlights methodology, expertise, and client outcomes.',
    icon: (props: any) => <ConsultingIcon {...props} />,
  },
  {
    id: 'Creative Services',
    title: 'Creative Services',
    description: 'For design, branding, and other creative projects.',
    icon: (props: any) => <CreativeIcon {...props} />,
  },
];


const ProposalForm: React.FC<ProposalFormProps> = ({ onSubmit, isLoading }) => {
  const [formState, setFormState] = useState<FormState>({
    template: 'General Business',
    companyInfo: '',
    teamInfo: '',
    caseStudies: '',
    timeline: '4-6 weeks',
    budget: '$10,000 - $15,000 USD',
    existingProposal: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFormState(prevState => ({ ...prevState, existingProposal: files[0] }));
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleRemoveFile = () => {
    setFormState(prevState => ({ ...prevState, existingProposal: null }));
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTemplateSelect = (templateId: string) => {
    setFormState(prevState => ({ ...prevState, template: templateId }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formState);
  };
  
  const isSubmitDisabled = isLoading || !formState.existingProposal;
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
      <div className="space-y-6">
        <fieldset>
          <legend className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">
            Step 1: Select a Template (Optional)
          </legend>
          <p className="text-sm text-slate-600 mb-4">Choose a template to guide the AI with industry-specific structure and tone. "General Business" is selected by default.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {templates.map((template) => {
              const isSelected = formState.template === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-start text-center ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-0.5">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <template.icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                  <h3 className="text-sm font-semibold text-slate-800">{template.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 hidden md:block flex-grow">{template.description}</p>
                </div>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">
            Step 2: Upload Terms of Reference (ToR)
          </legend>
          <p className="text-sm text-slate-600 mb-3">Upload a ToR, project brief, or RFP. The AI will extract the client name, project name, description, and scope of work directly from this document. <strong>This is a required step.</strong></p>
          
          {formState.existingProposal ? (
            <div className="flex items-center justify-between p-3 bg-slate-100 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-3">
                    <FileIcon className="w-6 h-6 text-slate-500"/>
                    <span className="text-sm font-medium text-slate-700">{formState.existingProposal.name}</span>
                </div>
                <button type="button" onClick={handleRemoveFile} className="text-slate-500 hover:text-red-600">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
          ) : (
            <div
                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex justify-center w-full px-6 py-10 border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300'} border-dashed rounded-lg cursor-pointer transition-colors`}
            >
                <div className="text-center">
                    <UploadIcon className="mx-auto h-10 w-10 text-slate-400"/>
                    <p className="mt-2 text-sm text-slate-600">
                        <span className="font-semibold text-blue-600">Click to upload document</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">PDF, DOCX, TXT, etc.</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} className="hidden" />
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Step 3: Provide Your Information (Optional)</legend>
          <p className="text-sm text-slate-600 mb-3">Add supplementary details about your company and team. The AI will weave this information into the proposal.</p>
          <div className="space-y-6">
            <TextareaField label="Your Company Info" name="companyInfo" value={formState.companyInfo} onChange={handleChange} placeholder="Briefly describe your company, its mission, and what makes it unique." />
            <TextareaField label="Your Team Info" name="teamInfo" value={formState.teamInfo} onChange={handleChange} placeholder="Introduce the key team members who will work on this project." />
            <TextareaField label="Relevant Case Studies or Testimonials" name="caseStudies" value={formState.caseStudies} onChange={handleChange} placeholder="Provide a brief case study or a client testimonial to build trust." />
          </div>
        </fieldset>
        
        <fieldset>
          <legend className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Step 4: Add Logistics (Optional)</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <InputField label="Estimated Timeline" name="timeline" value={formState.timeline} onChange={handleChange} placeholder="e.g., 4-6 weeks" />
             <InputField label="Estimated Budget" name="budget" value={formState.budget} onChange={handleChange} placeholder="e.g., $15,000" />
          </div>
        </fieldset>


        <div className="pt-5 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Generating Proposal...
              </>
            ) : (
              <>
                <SparkleIcon className="-ml-1 mr-2 h-5 w-5" />
                Generate Proposal
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProposalForm;