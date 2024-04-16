import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { gptPrompt } from "../shared/openai.ts";
import { createExitSignal, staticServer } from "../shared/server.ts";

import { Chalk } from "npm:chalk@5";
const chalk = new Chalk({ level: 1 });

const app = new Application();
const router = new Router();

// 创意助理 API 路由
router.post("/api/creative", async (ctx) => {
  try {
    const {
      projectType,
      projectDescription,
      detailedRequirements,
      stylePreference,
    } = await ctx.request.body().value;
    const initialIdeaPrompt = `Project Type: ${projectType} Description: ${projectDescription} Detailed Requirements: ${detailedRequirements} Style Preferences: ${stylePreference}`;
    const initialIdea = await gptPrompt(initialIdeaPrompt, {
      max_tokens: 800,
      temperature: 0.4,
    });
    ctx.response.body = { message: "Initial idea generated", initialIdea };
  } catch (err) {
    console.error(chalk.red("Error generating initial idea:"), err);
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Failed to generate initial idea due to server error",
      details: err.message || err.toString(),
      path: ctx.request.url.pathname,
    };
  }
});

// 应用路由和静态文件服务器
app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticServer);

// 启动服务
const PORT = 8000;
console.log(chalk.green(`\nListening on http://localhost:${PORT}`));
await app.listen({ port: PORT, signal: createExitSignal() });
