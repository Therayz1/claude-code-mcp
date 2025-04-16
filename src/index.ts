import { setupResources } from "./server/resources.js";
import { setupPrompts } from "./server/prompts.js";
import { setupTools } from "./server/tools.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// MCP sunucusu oluştur ve konfigüre et
const server = new McpServer({
  name: "Claude Code MCP",
  version: "1.0.0"
});

// Kaynakları, toolları ve prompt engineyi ayarla
setupResources(server);
setupPrompts(server);
setupTools(server);

// Sunucuyu başlat
async function main() {
  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Claude Code MCP server başlatıldı");
}

main().catch((error) => {
  console.error("Claude Code MCP server başlatılamadı:", error);
  process.exit(1);
});
