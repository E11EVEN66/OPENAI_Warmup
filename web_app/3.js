import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { gptPrompt } from "../shared/openai.ts";
import { createExitSignal, staticServer } from "../shared/server.ts";

import { Chalk } from "npm:chalk@5";
const chalk = new Chalk({ level: 1 });

const app = new Application();
const router = new Router();

// 多领域融合 API 路由
router.post("/api/feedback", async (ctx) => {
  try {
    const { projectDetails, role } = await ctx.request.body().value;

    // Make sure to debug or log the data to verify structure
    console.log(projectDetails, role);

    const feedbackPrompt = `As a ${role}, give feedback on the following project: ${projectDetails.description}.`;

    const feedback = await gptPrompt(feedbackPrompt, {
      max_tokens: 500,
      temperature: 0.7,
    });

    ctx.response.body = { message: "Feedback generated", feedback };
  } catch (err) {
    console.error(chalk.red("Error generating feedback:"), err);
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Internal server error",
      details: err.message || err.toString(),
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
