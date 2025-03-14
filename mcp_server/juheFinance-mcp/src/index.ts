import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import { getHsStockData, getUsStockData } from "./juheFinance.js";

// Load environment variables
dotenv.config();

// Create an MCP server
const server = new McpServer({
    name: "juhe-finance-stock-data",
    version: "1.0.0",
});

// Add a resource for HS stock/index data
server.resource(
    "hs-stock-data",
    new ResourceTemplate("hs-stock://{gidOrType}", { list: undefined }),
    async (uri, { gidOrType }) => {
        const gidOrTypeStr: string = Array.isArray(gidOrType) ? gidOrType[0] : gidOrType;
        try {
            const data = await getHsStockData(
                gidOrTypeStr.startsWith("sh") || gidOrTypeStr.startsWith("sz") ? gidOrTypeStr : undefined,
                gidOrTypeStr === "0" || gidOrTypeStr === "1" ? gidOrTypeStr : undefined
            );
            return {
                contents: [{
                    uri: uri.href,
                    text: data,
                    mimeType: "text/plain",
                }],
            };
        } catch (error) {
            throw new Error(`Failed to fetch HS stock data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
);

// Add a resource for U.S. stock data
server.resource(
    "us-stock-data",
    new ResourceTemplate("us-stock://{page}/{type}", { list: undefined }),
    async (uri, { page = "1", type = "1" }) => {
        const pageStr: string = Array.isArray(page) ? page[0] : page;
        const typeStr: string = Array.isArray(type) ? type[0] : type;
        try {
            const data = await getUsStockData(parseInt(pageStr), typeStr);
            return {
                contents: [{
                    uri: uri.href,
                    text: data,
                    mimeType: "text/plain",
                }],
            };
        } catch (error) {
            throw new Error(`Failed to fetch US stock data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
);

// Add a tool to get HS stock/index data
server.tool(
    "get-hs-stock-data",
    {
        gid: z.string().optional().describe("Stock code (e.g., sh601009, sz000001)"),
        type: z.enum(["0", "1"]).optional().describe("Index type (0: SSE Composite, 1: SZSE Component)"),
    },
    async ({ gid, type }) => {
        const gidStr: string = Array.isArray(gid) ? gid[0] : gid;
        const typeStr: string = Array.isArray(type) ? type[0] : type;
        try {
            const data = await getHsStockData(gidStr, typeStr);
            return {
                content: [{ type: "text", text: data }],
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error fetching HS stock data: ${error instanceof Error ? error.message : String(error)}` }],
                isError: true,
            };
        }
    }
);

// Add a tool to get U.S. stock data
server.tool(
    "get-us-stock-data",
    {
        page: z.string().optional().describe("Page number (default: 1)"),
        type: z.enum(["1", "2", "3"]).optional().describe("Items per page (1: 20, 2: 40, 3: 60; default: 1)"),
    },
    async ({ page = "1", type = "1" }) => {
        const pageStr: string = Array.isArray(page) ? page[0] : page;
        const typeStr: string = Array.isArray(type) ? type[0] : type;
        try {
            const data = await getUsStockData(parseInt(pageStr), typeStr);
            return {
                content: [{ type: "text", text: data }],
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error fetching US stock data: ${error instanceof Error ? error.message : String(error)}` }],
                isError: true,
            };
        }
    }
);

async function main() {
    try {
        // Create a transport for stdio communication
        const transport = new StdioServerTransport();

        // Connect the server to the transport
        await server.connect(transport);

        console.error("Juhe Finance Stock MCP Server running on stdio");
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

main();