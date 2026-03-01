/**
 * Example Tool with Zod Validation
 */

import { z } from 'zod';
import { logger } from '../middleware/logging.js';
import { wrapToolError } from '../utils/errors.js';

// Input schema
const EchoInputSchema = z.object({
  message: z.string().min(1).max(1000).describe('Message to echo back'),
  uppercase: z.boolean().optional().describe('Convert to uppercase'),
  repeat: z.number().int().min(1).max(10).optional().default(1).describe('Number of times to repeat'),
});

export const echoTool = {
  name: 'echo',
  description: 'Echo a message back, optionally in uppercase and repeated',
  inputSchema: EchoInputSchema,
  
  async execute(args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      // Validate input
      const input = EchoInputSchema.parse(args);
      
      logger.info({ tool: 'echo', input }, 'Executing echo tool');

      // Process message
      let message = input.message;
      if (input.uppercase) {
        message = message.toUpperCase();
      }

      // Repeat if requested
      const repeated = Array(input.repeat).fill(message).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: repeated,
          },
        ],
      };
    } catch (error) {
      logger.error({ error, tool: 'echo' }, 'Tool execution failed');
      throw wrapToolError(error);
    }
  },
};

// Calculator tool
const CalculateInputSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('Mathematical operation'),
  a: z.number().describe('First operand'),
  b: z.number().describe('Second operand'),
});

export const calculatorTool = {
  name: 'calculate',
  description: 'Perform basic mathematical operations',
  inputSchema: CalculateInputSchema,
  
  async execute(args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const input = CalculateInputSchema.parse(args);
      
      logger.info({ tool: 'calculate', input }, 'Executing calculator tool');

      let result: number;
      switch (input.operation) {
        case 'add':
          result = input.a + input.b;
          break;
        case 'subtract':
          result = input.a - input.b;
          break;
        case 'multiply':
          result = input.a * input.b;
          break;
        case 'divide':
          if (input.b === 0) {
            throw new Error('Division by zero');
          }
          result = input.a / input.b;
          break;
      }

      return {
        content: [
          {
            type: 'text',
            text: `${input.a} ${input.operation} ${input.b} = ${result}`,
          },
        ],
      };
    } catch (error) {
      logger.error({ error, tool: 'calculate' }, 'Tool execution failed');
      throw wrapToolError(error);
    }
  },
};

export const tools = [echoTool, calculatorTool];
