
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

// Original Schemas (kept for reference and easy revert)
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


// Simplified Schemas for Testing testFlow
const TestChatInputSchema = z.object({
  message: z.string().describe('The latest user message for test flow.'),
});
type TestChatInput = z.infer<typeof TestChatInputSchema>;

const TestChatOutputSchema = z.string().describe("A chunk of the test flow's textual response.");


// Simplified Test Flow
const testFlow = ai.defineFlow(
  {
    name: 'testBedrockChatFlow',
    inputSchema: TestChatInputSchema,
    outputSchema: TestChatOutputSchema, // Output is a string chunk
  },
  async function* (input: TestChatInput): AsyncGenerator<string> {
    console.log('[testFlow] Started with input:', input.message);
    yield `TestFlow: Chunk 1 for message: "${input.message}". `;
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 100));
    yield `TestFlow: Chunk 2.`;
    console.log('[testFlow] Finished.');
  }
);

export async function invokeChat(input: ChatInput): Promise<ReadableStream<string>> {
  // Map the original ChatInput to the TestChatInput for this test
  const testInput: TestChatInput = { message: input.message };
  
  console.log('[invokeChat] Calling testFlow with input:', testInput);
  const streamGenerator = testFlow(testInput);
  console.log('[invokeChat] Called testFlow. Returned type:', typeof streamGenerator);
  if (streamGenerator) {
    console.log('[invokeChat] streamGenerator.constructor.name:', streamGenerator.constructor?.name);
    console.log('[invokeChat] streamGenerator has [Symbol.asyncIterator]:', typeof (streamGenerator as any)[Symbol.asyncIterator] === 'function');
  }


  return new ReadableStream<string>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        if (!streamGenerator || typeof (streamGenerator as any)[Symbol.asyncIterator] !== 'function') {
          const errorDetail = `[invokeChat] CRITICAL ERROR: testFlow(testInput) did not return an async iterable. Received type: ${typeof streamGenerator}. Value: ${JSON.stringify(streamGenerator)}. Has Symbol.asyncIterator: ${typeof (streamGenerator as any)?.[Symbol.asyncIterator] === 'function'}`;
          console.error(errorDetail);
          
          if (streamGenerator && typeof (streamGenerator as any).then === 'function') {
            console.error("[invokeChat] The return value from testFlow(testInput) appears to be a Promise. This is unexpected for direct async generator invocation.");
          }
          controller.error(new Error(errorDetail)); // Send detailed error to client
          return;
        }

        console.log('[invokeChat] streamGenerator is async iterable. Starting iteration.');
        for await (const chunk of streamGenerator) {
          console.log('[invokeChat] Received chunk from streamGenerator:', chunk);
          controller.enqueue(encoder.encode(chunk));
        }
        console.log('[invokeChat] Finished iterating over streamGenerator.');
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e) || 'Streaming failed due to an unknown error in invokeChat';
        console.error("[invokeChat] Streaming error:", e);
        controller.error(e instanceof Error ? e : new Error(errorMessage));
      } finally {
        console.log('[invokeChat] Closing controller.');
        controller.close();
      }
    },
  });
}


// Original bedrockChatPrompt and chatFlow (kept for reference and easy revert)
/*
const bedrockChatPrompt = ai.definePrompt({
  name: 'bedrockChatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
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
      await promptResponsePromise;
    } catch (e) {
      console.error("BedrockChatFlow: Error during prompt streaming or awaiting final response:", e);
      if (e instanceof Error) {
        // It's often better to yield an error message or ensure controller.error() is robustly called
        // rather than re-throwing from within an async generator if the stream has already started.
        // For now, this will propagate up to invokeChat's catch block.
        throw new Error(`Error in AI prompt generation: ${e.message}`);
      }
      throw new Error("Unknown error in AI prompt generation.");
    }
  }
);
*/
