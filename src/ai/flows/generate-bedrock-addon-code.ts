
'use server';
/**
 * @fileOverview A Genkit flow for handling chat about Minecraft Bedrock and addon creation.
 *
 * - invokeChat - A function that handles the chat generation process.
 * - ChatInput - The input type for the invokeChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({text: z.string()})),
});

const ChatInputSchema = z.object({
  history: z.array(HistoryMessageSchema).optional().describe('The chat history between the user and the model.'),
  message: z.string().describe('The latest user message to the model.'),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An optional image provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

// This flow will stream text back. The actual output structure for the stream is handled by genkit.
// We are not defining a specific Zod output schema for the stream itself here.

export async function invokeChat(input: ChatInput): Promise<ReadableStream<Uint8Array>> {
  const {stream} = bedrockAddonChatFlow(input);
  return stream;
}

const bedrockAddonChatFlow = ai.defineFlow(
  {
    name: 'bedrockAddonChatFlow',
    inputSchema: ChatInputSchema,
    // Output is a stream, so we don't define an output schema for the flow directly in this way.
    // The `ai.generateStream` method handles the streaming output.
  },
  async (input) => {
    const {message, history, imageDataUri} = input;

    const promptParts = [];
    promptParts.push({
        text: `You are "Bedrock aí", an expert AI assistant specializing in Minecraft Bedrock Edition and addon creation (including behavior packs, resource packs, scripting, entities, items, blocks, etc.).
Your primary goal is to help users by answering their questions, providing explanations, generating code snippets, and offering guidance related to Minecraft Bedrock development.
Strictly adhere to the scope of Minecraft Bedrock and addon development.
If a question is unrelated to Minecraft Bedrock, its addons, or general coding concepts applicable to it, politely decline to answer and gently steer the conversation back to Bedrock development.
Do not answer questions about other games, general knowledge, or topics outside this scope.
When generating code (e.g., JSON, JavaScript for scripting), make sure it is well-formatted and clearly explained.
If the user provides an image, consider it as part of their query context. For example, it might be a screenshot of an error, a texture, or a diagram relevant to their addon.
Previous conversation history is provided. Use it to maintain context.`,
    });

    if (history) {
      for (const h of history) {
        promptParts.push(...h.parts.map(part => ({ role: h.role, ...part })));
      }
    }

    if (imageDataUri) {
      promptParts.push({
        text: "The user has provided the following image as part of their query:",
      });
      promptParts.push({media: {url: imageDataUri}});
    }

    promptParts.push({role: 'user', text: message});


    const {stream, response} = ai.generateStream({
        prompt: promptParts,
        model: 'googleai/gemini-2.0-flash', // Using the model defined in genkit.ts
        config: {
            // Adjust safety settings if needed, for now, defaults are fine for text chat.
            // Example:
            // safetySettings: [
            //   { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            // ],
        }
    });

    // The flow itself will return the stream and the promise for the full response.
    // The exported invokeChat function above will only return the stream.
    return {stream, response};
  }
);
