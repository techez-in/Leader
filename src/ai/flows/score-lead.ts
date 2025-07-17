'use server';

/**
 * @fileOverview An AI agent that scores leads based on their information.
 *
 * - scoreLead - A function that scores a lead and returns a score.
 * - ScoreLeadInput - The input type for the scoreLead function.
 * - ScoreLeadOutput - The return type for the scoreLead function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreLeadInputSchema = z.object({
  timeSinceAdded: z
    .string()
    .describe('The amount of time since the lead was added.'),
  priority: z
    .enum(['Low', 'Medium', 'High'])
    .describe('The priority of the lead.'),
  followUpActivity: z
    .string()
    .describe('The description of the follow up activity for the lead.'),
  notes: z.string().optional().describe('Any notes about the lead.'),
});
export type ScoreLeadInput = z.infer<typeof ScoreLeadInputSchema>;

const ScoreLeadOutputSchema = z.object({
  score: z.number().describe('The score of the lead, from 0 to 100.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the score, explaining the factors that influenced the score.'),
});
export type ScoreLeadOutput = z.infer<typeof ScoreLeadOutputSchema>;

export async function scoreLead(input: ScoreLeadInput): Promise<ScoreLeadOutput> {
  return scoreLeadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreLeadPrompt',
  input: {schema: ScoreLeadInputSchema},
  output: {schema: ScoreLeadOutputSchema},
  prompt: `You are an AI expert in lead scoring. You will receive information about a lead and must provide a score between 0 and 100, as well as reasoning for that score.

Time since added: {{{timeSinceAdded}}}
Priority: {{{priority}}}
Follow up activity: {{{followUpActivity}}}
Notes: {{{notes}}}

Provide a score and reasoning. Consider the time since added, priority, and follow up activity to produce the score.`,
});

const scoreLeadFlow = ai.defineFlow(
  {
    name: 'scoreLeadFlow',
    inputSchema: ScoreLeadInputSchema,
    outputSchema: ScoreLeadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
