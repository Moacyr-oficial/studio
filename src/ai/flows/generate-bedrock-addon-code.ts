
'use server';
/**
 * @fileOverview A Genkit flow for handling chat interactions related to Minecraft Bedrock Edition addon development.
 *
 * - invokeChat - A function that streams responses for a given chat input.
 * - ChatInput - The input type for the invokeChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for individual messages in the history, matching Genkit's expected format
const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({text: z.string()})),
});

const ChatInputSchema = z.object({
  history: z.array(HistoryMessageSchema).optional().describe('The chat history.'),
  message: z.string().describe('The latest user message.'),
  imageDataUri: z.string().optional().describe(
    "An optional image provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// This prompt string will be used by ai.generateStream
// It includes system instructions and placeholders for the current user query.
const PROMPT_TEMPLATE = `You are a helpful AI assistant specialized in Minecraft Bedrock Edition addon development.
Your goal is to assist users with creating and understanding addons, behavior packs, resource packs, and related concepts.
Provide code examples in JSON, JavaScript (for GameTest Framework or custom entities/components if applicable), or other relevant formats.
If the user asks for something unrelated to Minecraft Bedrock addons, politely decline and steer the conversation back to addons.

Consider any provided image as part of the user's query. For example, they might show a screenshot of an error, a visual concept for an entity, or part of a behavior pack structure.

User's current query:
{{#if message}}
Message:
{{{message}}}
{{/if}}
{{#if imageDataUri}}
Image:
{{media url=imageDataUri}}
{{/if}}
`;

export async function invokeChat(input: ChatInput): Promise<ReadableStream<Uint8Array>> {
  // Data for the Handlebars template
  const templateInput = {
    message: input.message,
    imageDataUri: input.imageDataUri,
  };

  const {stream, response: fullResponsePromise} = ai.generateStream({
    // Model is taken from the default configured in src/ai/genkit.ts
    prompt: PROMPT_TEMPLATE,
    input: templateInput, // Pass the prepared input for Handlebars
    history: input.history || [], // Pass history, ensure it's an array
    config: {
      // Optional: Add safetySettings or other generation config here if needed
      // safetySettings: [
      //   {
      //     category: 'HARM_CATEGORY_HARASSMENT',
      //     threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      //   },
      // ],
    },
  });

  // It's good practice to handle the full response promise, e.g., for logging or error checking,
  // though for streaming, the primary focus is the stream itself.
  fullResponsePromise
    .then(finalResponse => {
      // You can log or process the final aggregated response if necessary
      // console.log('AI full response received.');
      if (finalResponse.candidates[0]?.finishReason !== 'STOP') {
        // console.warn('Stream finished for a reason other than STOP:', finalResponse.candidates[0]?.finishReason);
      }
    })
    .catch(error => {
      console.error('Error processing full AI response:', error);
    });

  return stream;
}
