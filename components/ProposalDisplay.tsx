
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ProposalData } from '../types';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import DownloadIcon from './icons/DownloadIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface ProposalDisplayProps {
  proposal: ProposalData;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8 break-inside-avoid">
    <h3 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">{title}</h3>
    <div>
        {children}
    </div>
  </div>
);

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const createMarkup = (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
    return { __html: html };
  };

  const lines = content.split('\n');
  // Fix: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
  const renderedElements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`ul-${renderedElements.length}`} className="list-disc list-outside pl-6 my-4 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={createMarkup(item)} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      listItems.push(trimmedLine.substring(2));
    } else {
      flushList();
      if (trimmedLine) {
        renderedElements.push(<p key={`p-${index}`} className="my-2" dangerouslySetInnerHTML={createMarkup(line)} />);
      }
    }
  });

  flushList();

  return <div className="text-slate-700">{renderedElements}</div>;
};


const ProposalDisplay: React.FC<ProposalDisplayProps> = ({ proposal }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const proposalRef = useRef<HTMLDivElement>(null);

  const formatProposalForText = (): string => {
    let text = ``;
    text += `# ${proposal.title}\n\n`;
    text += `**Project Name:** ${proposal.projectName}\n`;
    text += `**Client Name:** ${proposal.clientName}\n\n`;
    text += `## Introduction\n${proposal.introduction}\n\n`;
    text += `## Problem Statement\n${proposal.problemStatement}\n\n`;
    text += `## Proposed Solution\n${proposal.proposedSolution}\n\n`;
    text += `## Scope of Work\n${proposal.scopeOfWork}\n\n`;
    text += `## About the Team\n${proposal.teamIntroduction}\n\n`;
    text += `## Case Studies\n${proposal.caseStudies}\n\n`;
    text += `## Timeline\n${proposal.timeline}\n\n`;
    text += `## Budget\n`;
    proposal.budget.breakdown.forEach(item => {
        text += `- ${item.item}: $${item.cost.toLocaleString()}\n`;
    });
    text += `**Total:** $${proposal.budget.total.toLocaleString()}\n\n`;
    text += `## Next Steps\n${proposal.nextSteps}\n\n`;
    text += `## Conclusion\n${proposal.conclusion}\n\n`;
    return text;
  };

  const handleCopyToClipboard = () => {
    const proposalText = formatProposalForText();
    navigator.clipboard.writeText(proposalText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPdf = async () => {
    const contentElement = proposalRef.current;
    if (!contentElement) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(contentElement, {
        scale: 2, // for better resolution
        logging: false,
        onclone: (document) => {
          // Hide buttons in the cloned document before capturing
          const buttons = document.querySelector('.proposal-actions');
          if (buttons) (buttons as HTMLElement).style.display = 'none';
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageMargin = 15;
      const contentWidth = pdfWidth - (pageMargin * 2);
      const pdfHeight = (imgProps.height * contentWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', pageMargin, position + pageMargin, contentWidth, pdfHeight);
      heightLeft -= (pdf.internal.pageSize.getHeight() - (pageMargin * 2));

      while (heightLeft > 0) {
        position -= (pdf.internal.pageSize.getHeight() - pageMargin);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', pageMargin, position + pageMargin, contentWidth, pdfHeight);
        heightLeft -= (pdf.internal.pageSize.getHeight() - pageMargin);
      }

      pdf.save(`${proposal.projectName.replace(/\s/g, '_')}_Proposal.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div ref={proposalRef} className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
      <div className="proposal-actions flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800">{proposal.title}</h2>
        <div className="flex space-x-2">
            <button onClick={handleCopyToClipboard} className="flex items-center px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors">
                {copied ? <CheckIcon className="w-5 h-5 text-green-600 mr-2" /> : <CopyIcon className="w-5 h-5 mr-2" />}
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleDownloadPdf} disabled={isDownloading} className="flex items-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors disabled:bg-slate-400">
                {isDownloading ? <LoadingSpinner className="animate-spin w-5 h-5 mr-2" /> : <DownloadIcon className="w-5 h-5 mr-2" />}
                {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
        </div>
      </div>

      <div className="space-y-2 mb-8 text-sm text-slate-600">
        <p><strong>Project:</strong> {proposal.projectName}</p>
        <p><strong>Client:</strong> {proposal.clientName}</p>
      </div>

      <Section title="Introduction">
        <MarkdownRenderer content={proposal.introduction} />
      </Section>
      <Section title="Problem Statement">
        <MarkdownRenderer content={proposal.problemStatement} />
      </Section>
      <Section title="Proposed Solution">
        <MarkdownRenderer content={proposal.proposedSolution} />
      </Section>
      <Section title="Scope of Work">
        <MarkdownRenderer content={proposal.scopeOfWork} />
      </Section>
      <Section title="About the Team">
        <MarkdownRenderer content={proposal.teamIntroduction} />
      </Section>
      <Section title="Case Studies">
        <MarkdownRenderer content={proposal.caseStudies} />
      </Section>
      <Section title="Timeline">
        <MarkdownRenderer content={proposal.timeline} />
      </Section>
      <Section title="Budget">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Cost</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {proposal.budget.breakdown.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{item.item}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 text-right">${item.cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td className="px-6 py-4 text-sm font-bold text-slate-800">Total</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">${proposal.budget.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </Section>
      <Section title="Next Steps">
        <MarkdownRenderer content={proposal.nextSteps} />
      </Section>
      <Section title="Conclusion">
        <MarkdownRenderer content={proposal.conclusion} />
      </Section>
    </div>
  );
};

export default ProposalDisplay;
