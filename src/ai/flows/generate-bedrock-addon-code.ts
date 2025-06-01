
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

const bedrockChatPrompt = ai.definePrompt({
  name: 'bedrockChatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema}, // Defines the structure of the full response
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
    outputSchema: z.string().describe("A chunk of the AI assistant's streamed response."), // Schema for yielded chunks
  },
  async function* (input: ChatInput): AsyncGenerator<string> {
    const {stream: responseStream} = bedrockChatPrompt.generateStream(input);

    for await (const chunk of responseStream) {
      // chunk.text provides the text content of the current generation step
      if (chunk.text) {
        yield chunk.text;
      }
      // If we needed to access structured output per chunk (based on ChatOutputSchema):
      // else if (chunk.output && typeof chunk.output.response === 'string') {
      //   yield chunk.output.response;
      // }
    }
  }
);

export async function invokeChat(input: ChatInput): Promise<ReadableStream<string>> {
  const streamGenerator = chatFlow(input); // chatFlow(input) returns an AsyncGenerator<string>

  return new ReadableStream<string>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of streamGenerator) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e) {
        console.error("Streaming error in bedrockChatFlow execution:", e);
        // Optionally, enqueue an error message or handle differently
        controller.error(e instanceof Error ? e : new Error('Streaming failed'));
      } finally {
        controller.close();
      }
    },
  });
}
