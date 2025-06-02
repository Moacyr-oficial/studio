
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

// ChatOutputSchema is kept for type definition clarity but not enforced on the flow's direct output
// when streaming raw text.
const ChatOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


// This prompt object is now primarily for schema definition and naming,
// as ai.generateStream will be used directly with a constructed prompt.
const bedrockChatPrompt = ai.definePrompt({
  name: 'bedrockChatPrompt',
  input: {schema: ChatInputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `This prompt string is not directly used by ai.generateStream in this flow.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'bedrockChatFlow',
    inputSchema: ChatInputSchema,
    // No outputSchema for the flow itself when it's directly returning a ReadableStream<string>
  },
  async (input: ChatInput): Promise<ReadableStream<string>> => {
    console.log('[chatFlow] Started with input:', JSON.stringify({ message: input.message, hasImage: !!input.imageDataUri, historyLength: input.history?.length || 0 }));

    let promptStream: AsyncIterableIterator<any>;
    let promptResponsePromise: Promise<any>;

    const systemInstruction = `You are a friendly and expert Minecraft Bedrock Edition addon development assistant.
Your goal is to help users create addon code, answer their questions about Bedrock addon development, and provide guidance.
If the user asks for code, generate a concise and correct Bedrock Edition addon code snippet based on their request. Format code blocks clearly.
If the user asks a question, provide a clear and helpful answer.
If the user's request is ambiguous, ask clarifying questions.`;

    const currentMessagePromptPart = `Current User Message: ${input.message}\n\nYour Response:`;

    const promptForGenerateStream: Array<{text?: string; media?: {url: string}}> = [];
    promptForGenerateStream.push({ text: systemInstruction });

    if (input.imageDataUri) {
      promptForGenerateStream.push({ text: "User has also provided an image related to their query:" });
      promptForGenerateStream.push({ media: { url: input.imageDataUri } });
    }
    promptForGenerateStream.push({ text: currentMessagePromptPart });

    try {
      // Use ai.generateStream directly
      ({ stream: promptStream, response: promptResponsePromise } = ai.generateStream({
        model: 'googleai/gemini-2.0-flash', // Ensure model is specified
        prompt: promptForGenerateStream,
        history: input.history, // Pass history if supported by ai.generateStream
      }));
      console.log('[chatFlow] ai.generateStream called successfully.');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("[chatFlow] Error calling ai.generateStream:", errorMessage, e);
      return new ReadableStream<string>({
        start(controller) {
          controller.error(new Error(`Failed to start AI stream: ${errorMessage}`));
        }
      });
    }

    const encoder = new TextEncoder();
    let finalized = false;

    const readableStream = new ReadableStream<string>({
      async start(controller) {
        console.log('[chatFlow_ReadableStream] Stream started.');
        try {
          for await (const chunk of promptStream) {
            if (chunk?.text) {
              controller.enqueue(encoder.encode(chunk.text));
            } else {
              console.warn('[chatFlow_ReadableStream] Received unexpected chunk structure:', JSON.stringify(chunk, null, 2));
            }
          }
          await promptResponsePromise; // Wait for the full response to complete for tracing, etc.
          console.log('[chatFlow_ReadableStream] Prompt stream and response promise finished successfully.');
          if (!finalized) {
            controller.close();
            finalized = true;
          }
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          console.error("[chatFlow_ReadableStream] Streaming error or promptResponsePromise rejection:", errorMessage, e);
          if (!finalized) {
            controller.error(e instanceof Error ? e : new Error(errorMessage));
            finalized = true;
          }
        }
      },
      cancel(reason) {
        console.log('[chatFlow_ReadableStream] Stream cancelled:', reason);
        // Add any necessary cleanup for cancellation if promptStream supports it (e.g., reader.cancel())
        if (!finalized) {
            finalized = true; // Ensure no further operations on controller
        }
      }
    });
    console.log('[chatFlow] Returning ReadableStream.');
    return readableStream;
  }
);


export async function invokeChat(input: ChatInput): Promise<ReadableStream<string>> {
  console.log('[invokeChat] Calling chatFlow with input message:', input.message);
  try {
    const stream = await chatFlow(input);
    console.log('[invokeChat] Received stream from chatFlow.');
    return stream;
  } catch (e) {
     const errorMessage = e instanceof Error ? e.message : 'Unknown error calling chatFlow';
     console.error('[invokeChat] Error calling chatFlow:', errorMessage, e);
     return new ReadableStream<string>({
        start(controller) {
            controller.error(new Error(`Failed to initiate chat: ${errorMessage}`));
        }
     });
  }
}
