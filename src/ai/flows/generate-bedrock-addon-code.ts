
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

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


const bedrockChatPrompt = ai.definePrompt({
  name: 'bedrockChatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema}, // This is the schema for the *complete* output of a chunk
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
    // The output schema for the flow itself usually refers to the resolved, complete output.
    // Since we're streaming text, the "complete" output might be the full concatenated string,
    // or in this case, we can align it with the prompt's output schema for consistency.
    outputSchema: ChatOutputSchema,
  },
  async (input: ChatInput): Promise<ReadableStream<string>> => {
    console.log('[chatFlow] Started with input:', input.message);
    const {stream: promptStream, response: promptResponsePromise} = bedrockChatPrompt.generateStream(input);
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream<string>({
      async start(controller) {
        console.log('[chatFlow_ReadableStream] Stream started.');
        try {
          for await (const chunk of promptStream) {
            if (chunk?.output?.response) {
              // console.log('[chatFlow_ReadableStream] Yielding chunk:', chunk.output.response);
              controller.enqueue(encoder.encode(chunk.output.response));
            }
          }
          await promptResponsePromise; // Wait for the full response to complete
          console.log('[chatFlow_ReadableStream] Prompt stream finished.');
          controller.close();
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          console.error("[chatFlow_ReadableStream] Streaming error:", errorMessage, e);
          controller.error(e instanceof Error ? e : new Error(errorMessage));
        }
      }
    });
    console.log('[chatFlow] Returning ReadableStream.');
    return readableStream;
  }
);


export async function invokeChat(input: ChatInput): Promise<ReadableStream<string>> {
  console.log('[invokeChat] Calling chatFlow with input:', input.message);
  try {
    const stream = await chatFlow(input);
    console.log('[invokeChat] Received stream from chatFlow.');
    return stream;
  } catch (e) {
     const errorMessage = e instanceof Error ? e.message : 'Unknown error calling chatFlow';
     console.error('[invokeChat] Error calling chatFlow:', errorMessage, e);
     // Return a stream that emits the error
     return new ReadableStream<string>({
        start(controller) {
            controller.error(new Error(`Failed to initiate chat: ${errorMessage}`));
            controller.close();
        }
     });
  }
}
