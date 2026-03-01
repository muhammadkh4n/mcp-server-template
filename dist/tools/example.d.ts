/**
 * Example Tool with Zod Validation
 */
import { z } from 'zod';
export declare const echoTool: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        message: z.ZodString;
        uppercase: z.ZodOptional<z.ZodBoolean>;
        repeat: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        repeat: number;
        uppercase?: boolean | undefined;
    }, {
        message: string;
        uppercase?: boolean | undefined;
        repeat?: number | undefined;
    }>;
    execute(args: unknown): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
};
export declare const calculatorTool: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        operation: z.ZodEnum<["add", "subtract", "multiply", "divide"]>;
        a: z.ZodNumber;
        b: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        operation: "add" | "subtract" | "multiply" | "divide";
        a: number;
        b: number;
    }, {
        operation: "add" | "subtract" | "multiply" | "divide";
        a: number;
        b: number;
    }>;
    execute(args: unknown): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
};
export declare const tools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        message: z.ZodString;
        uppercase: z.ZodOptional<z.ZodBoolean>;
        repeat: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        repeat: number;
        uppercase?: boolean | undefined;
    }, {
        message: string;
        uppercase?: boolean | undefined;
        repeat?: number | undefined;
    }>;
    execute(args: unknown): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        operation: z.ZodEnum<["add", "subtract", "multiply", "divide"]>;
        a: z.ZodNumber;
        b: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        operation: "add" | "subtract" | "multiply" | "divide";
        a: number;
        b: number;
    }, {
        operation: "add" | "subtract" | "multiply" | "divide";
        a: number;
        b: number;
    }>;
    execute(args: unknown): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
})[];
//# sourceMappingURL=example.d.ts.map