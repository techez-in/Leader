
'use server';

/**
 * @fileOverview An AI agent that parses lead data from a CSV file.
 *
 * - parseLeadsFromCsv - A function that takes CSV data and returns a structured array of leads.
 * - CsvInput - The input type for the parseLeadsFromCsv function.
 * - ParsedLeadsOutput - The return type for the parseLeadsFromCsv function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LEAD_STATUSES, LEAD_PRIORITIES, LEAD_SOURCES } from '@/lib/types';
import type { AddLeadFormValues } from '@/components/add-lead-dialog';

const CsvInputSchema = z.object({
  csvData: z.string().describe('The raw text content of a CSV file containing lead data.'),
});
export type CsvInput = z.infer<typeof CsvInputSchema>;

// Use the same type as the AddLeadForm so we can reuse the notion `addLead` logic
const ParsedLeadSchema = z.object({
  name: z.string().describe("The full name of the lead."),
  contact: z.string().describe("The contact email address of the lead. If not available, use a placeholder like 'no-email@example.com'."),
  status: z.enum(LEAD_STATUSES).describe("The lead's current status."),
  priority: z.enum(LEAD_PRIORITIES).describe("The priority level of the lead."),
  source: z.enum(LEAD_SOURCES).describe("Where the lead came from."),
  followUpDate: z.string().describe("The follow-up date in YYYY-MM-DD format. If not provided, calculate a date 7 days from now."),
});

const ParsedLeadsOutputSchema = z.array(ParsedLeadSchema);
export type ParsedLeadsOutput = z.infer<typeof ParsedLeadsOutputSchema>;

export async function parseLeadsFromCsv(input: CsvInput): Promise<AddLeadFormValues[]> {
  const parsedData = await parseLeadsFlow(input);

  // Convert the string date from AI to a Date object
  return parsedData.map(lead => ({
    ...lead,
    followUpDate: new Date(lead.followUpDate)
  }));
}

const prompt = ai.definePrompt({
  name: 'parseLeadsCsvPrompt',
  input: { schema: CsvInputSchema },
  output: { schema: ParsedLeadsOutputSchema },
  prompt: `You are an expert data parsing agent. Your task is to analyze the following CSV data and extract lead information.
  
  The user can provide data in any column order. You must intelligently map the columns to the required fields: name, contact, status, priority, source, and followUpDate.

  - For 'name', look for columns like 'Name', 'Full Name', 'Lead Name'.
  - For 'contact', look for 'Email', 'Contact Info', 'Email Address'. If no email is found, use a placeholder like 'no-email@example.com'.
  - For 'status', map intelligently. 'new' or 'todo' should be 'New Lead'. 'active' or 'working' should be 'In Progress'. 'won' or 'closed' should be 'Converted'. 'lost' should be 'Dropped'. Default to 'New Lead' if unclear.
  - For 'priority', map 'high'/'urgent' to 'High', 'medium'/'normal' to 'Medium', and 'low' to 'Low'. Default to 'Medium'.
  - For 'source', map 'web' to 'Website', 'social' to 'LinkedIn'. Default to 'Other'.
  - For 'followUpDate', look for columns like 'Follow Up', 'Next Action Date'. It must be in YYYY-MM-DD format. If no date is found, set it to one week from today's date.

  CSV Data:
  {{{csvData}}}
  `,
});

const parseLeadsFlow = ai.defineFlow(
  {
    name: 'parseLeadsFlow',
    inputSchema: CsvInputSchema,
    outputSchema: ParsedLeadsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output || [];
  }
);
