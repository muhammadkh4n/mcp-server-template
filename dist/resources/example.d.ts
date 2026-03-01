/**
 * Example Resource with Caching
 */
export declare const configResource: {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
    read(): Promise<{
        contents: Array<{
            uri: string;
            mimeType?: string;
            text: string;
        }>;
    }>;
};
export declare const timestampResource: {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
    read(): Promise<{
        contents: Array<{
            uri: string;
            mimeType?: string;
            text: string;
        }>;
    }>;
};
export declare const resources: {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
    read(): Promise<{
        contents: Array<{
            uri: string;
            mimeType?: string;
            text: string;
        }>;
    }>;
}[];
export declare function destroyResourceCache(): void;
//# sourceMappingURL=example.d.ts.map