
'use server';
/**
 * @fileOverview A conversational AI agent for Minecraft Bedrock Edition addon development.
 *
 * Exports:
 * - invokeChat: An async function that handles the chat interaction, returning a stream of responses.
 * - ChatInput: The type for the input to the invokeChat function.
 * - ChatOutput: The type for the *fully formed* return value of the AI's generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessagePartSchema = z.object({
  text: z.string(),
});

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(MessagePartSchema),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe("The conversation history."),
  message: z.string().describe('The latest user message.'),
  imageDataUri: z.string().optional().describe(
    "An image uploaded by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// The bedrockChatPrompt is temporarily unused for this debugging step.
// const bedrockChatPrompt = ai.definePrompt({
//   name: 'bedrockChatPrompt',
//   input: {schema: ChatInputSchema},
//   output: {schema: ChatOutputSchema}, 
//   prompt: `You are a friendly and expert Minecraft Bedrock Edition addon development assistant.
// Your goal is to help users create addon code, answer their questions about Bedrock addon development, and provide guidance.
// Use the provided conversation history to understand the context of the user's current message.
// If the user asks for code, generate a concise and correct Bedrock Edition addon code snippet based on their request and the conversation history. Format code blocks clearly.
// If the user asks a question, provide a clear and helpful answer.
// If the user's request is ambiguous, ask clarifying questions.

// Conversation History:
// {{#each history}}
// {{this.role}}: {{this.parts.[0].text}}
// {{/each}}

// {{#if imageDataUri}}
// User has also provided an image related to their query:
// {{media url=imageDataUri}}
// {{/if}}

// Current User Message: {{{message}}}

// Your Response:`,
// });

const chatFlow = ai.defineFlow(
  {
    name: 'bedrockChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string().describe("A chunk of the AI assistant's streamed response."),
  },
  async function* (input: ChatInput): AsyncGenerator<string> {
    // Simplified flow for debugging:
    yield "This is a test chunk 1... ";
    // Simulate a delay like an API call
    await new Promise(resolve => setTimeout(resolve, 500));
    yield "This is a test chunk 2 from the simplified flow.";
    // Ensure the yielded content is just a string as per outputSchema
  }
);

export async function invokeChat(input: ChatInput): Promise<ReadableStream<string>> {
  const streamGenerator = chatFlow(input); 

  return new ReadableStream<string>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of streamGenerator) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e: unknown) {
        console.error("Streaming error in bedrockChatFlow execution:", e);
        const errorMessage = e instanceof Error ? e.message : 'Streaming failed due to an unknown error';
        // Ensure the error passed to controller.error is an Error instance
        controller.error(new Error(errorMessage));
      } finally {
        controller.close();
      }
    },
  });
}
