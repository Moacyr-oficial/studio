'use server';
/**
 * @fileOverview A Bedrock Edition addon code generator AI agent.
 *
 * - generateBedrockAddonCode - A function that handles the Bedrock Edition addon code generation process.
 * - GenerateBedrockAddonCodeInput - The input type for the generateBedrockAddonCode function.
 * - GenerateBedrockAddonCodeOutput - The return type for the generateBedrockAddonCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBedrockAddonCodeInputSchema = z.object({
  description: z.string().describe('The description of the Bedrock Edition addon to generate.'),
});
export type GenerateBedrockAddonCodeInput = z.infer<typeof GenerateBedrockAddonCodeInputSchema>;

const GenerateBedrockAddonCodeOutputSchema = z.object({
  code: z.string().describe('The generated Bedrock Edition addon code snippet.'),
});
export type GenerateBedrockAddonCodeOutput = z.infer<typeof GenerateBedrockAddonCodeOutputSchema>;

export async function generateBedrockAddonCode(input: GenerateBedrockAddonCodeInput): Promise<GenerateBedrockAddonCodeOutput> {
  return generateBedrockAddonCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBedrockAddonCodePrompt',
  input: {schema: GenerateBedrockAddonCodeInputSchema},
  output: {schema: GenerateBedrockAddonCodeOutputSchema},
  prompt: `You are an expert Minecraft Bedrock Edition addon developer.

You will generate Bedrock Edition addon code snippets based on the user's description.

Description: {{{description}}}`,
});

const generateBedrockAddonCodeFlow = ai.defineFlow(
  {
    name: 'generateBedrockAddonCodeFlow',
    inputSchema: GenerateBedrockAddonCodeInputSchema,
    outputSchema: GenerateBedrockAddonCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
