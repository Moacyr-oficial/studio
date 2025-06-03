import { config } from 'dotenv';
config();

import '@/ai/flows/generate-bedrock-addon-code.ts';
// Ensure this line is present if you have other flows, e.g.:
// import '@/ai/flows/another-flow.ts';
