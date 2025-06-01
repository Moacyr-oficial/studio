
'use server';
/**
 * @fileOverview A conversational AI agent for Minecraft Bedrock Edition addon development.
 *
 * Exports:
 * - invokeChat: An async function that handles the chat interaction, returning a stream of responses.
 * - ChatInput: The type for the input to the invokeChat function.
 * - ChatOutput: The type for the *fully formed* return value of the AI's generation (not used for stream chunks).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit'; // Genkit's re-exported Zod

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

// This schema defines the structure of the *fully formed* output from the AI,
// if we weren't streaming. For streaming, we'll yield parts of this.
const ChatOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Restoring the bedrockChatPrompt
const bedrockChatPrompt = ai.definePrompt({
  name: 'bedrockChatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema}, // The prompt itself is expected to eventually produce this object structure
  prompt: `You are a friendly and expert Minecraft Bedrock Edition addon development assistant.
Your goal is to help users create addon code, answer their questions about Bedrock addon development, and provide guidance.
Use the provided conversation history to understand the context of the user's current message.
If the user asks for code, generate a concise and correct Bedrock Edition addon code snippet based on their request and the conversation history. Format code blocks clearly.
If the user asks a question, provide a clear and helpful answer.
If the user's request is ambiguous, ask clarifying questions.

Conversation History:
{{#each history}}
{{this.role}}: {{this.parts.[0].text}}
{{/each}}

{{#if imageDataUri}}
User has also provided an image related to their query:
{{media url=imageDataUri}}
{{/if}}

Current User Message: {{{message}}}

Your Response:`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'bedrockChatFlow',
    inputSchema: ChatInputSchema,
    // The outputSchema for a streaming flow defines the type of EACH YIELDED CHUNK.
    outputSchema: z.string().describe("A chunk of the AI assistant's textual response."),
  },
  async function* (input: ChatInput): AsyncGenerator<string> {
    const {stream: promptStream, response: promptResponsePromise} = bedrockChatPrompt.generateStream(input);

    try {
      for await (const chunk of promptStream) {
        if (chunk?.output?.response) {
          yield chunk.output.response;
        }
      }
      // Await the full response promise from the prompt's stream
      // to ensure all resources are cleaned up and the prompt execution is complete.
      await promptResponsePromise;
    } catch (e) {
      console.error("BedrockChatFlow: Error during prompt streaming or awaiting final response:", e);
      // Depending on the desired behavior, you might want to yield an error message here
      // or re-throw if the stream itself should be considered failed.
      // For now, let's re-throw to make it visible to the client-side error handling.
      if (e instanceof Error) {
        throw new Error(`Error in AI prompt generation: ${e.message}`);
      }
      throw new Error("Unknown error in AI prompt generation.");
    }
  }
);

export async function invokeChat(input: ChatInput): Promise<ReadableStream<string>> {
  const streamGenerator = chatFlow(input);

  return new ReadableStream<string>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        if (!streamGenerator || typeof streamGenerator[Symbol.asyncIterator] !== 'function') {
          const errorDetail = `Internal error: chatFlow(input) did not return an async iterable. Received type: ${typeof streamGenerator}. Value: ${JSON.stringify(streamGenerator)}`;
          console.error(errorDetail);
          
          if (streamGenerator && typeof (streamGenerator as any).then === 'function') {
            console.error("The return value from chatFlow(input) appears to be a Promise. This is unexpected if chatFlow is an async generator itself. Awaiting might be needed before iteration if this is the case, but ai.defineFlow should return the generator directly.");
          }
          throw new Error(errorDetail);
        }

        for await (const chunk of streamGenerator) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e: unknown) {
        console.error("Streaming error in bedrockChatFlow execution (invokeChat):", e);
        const errorMessage = e instanceof Error ? e.message : String(e) || 'Streaming failed due to an unknown error';
        controller.error(e instanceof Error ? e : new Error(errorMessage));
      } finally {
        controller.close();
      }
    },
  });
}
