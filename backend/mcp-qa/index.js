import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const server = new Server({ name: "qa-mcp-server", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "query_sentry",
                description: "Query Sentry API for p50/p95 trace stats.",
                inputSchema: { type: "object", properties: {}, required: [] }
            },
            {
                name: "query_database",
                description: "Run a read-only query against the Supabase database (uses test_teardown as a safety wrapper placeholder for now).",
                inputSchema: { type: "object", properties: {}, required: [] }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "query_sentry") {
        try {
            // Run the python script we created earlier
            const { stdout, stderr } = await execAsync("python3 ../scripts/query_sentry.py");
            return { content: [{ type: "text", text: stdout || stderr }] };
        } catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    }
    
    if (request.params.name === "query_database") {
        return { content: [{ type: "text", text: "Database queried successfully (Simulated for this MCP demo)" }] };
    }

    throw new Error(`Tool not found: ${request.params.name}`);
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
