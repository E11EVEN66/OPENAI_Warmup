import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { gptPrompt } from "../shared/openai.ts";
import { createExitSignal, staticServer } from "../shared/server.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

import { Chalk } from "npm:chalk@5";
const chalk = new Chalk({ level: 1 });

const app = new Application();
const router = new Router();
app.use(oakCors());

//A + B = C
router.post("/api/generate_c", async (ctx) => {
  try {
    const { elementA, elementB } = await ctx.request.body().value;
    const prompt = `Combine the concepts '${elementA}' and '${elementB}'. What innovative concept could emerge from this combination?`;
    const creativeIdea = await gptPrompt(prompt, {
      max_tokens: 500,
      temperature: 0.6,
    });
    ctx.response.body = { message: "Creative concept generated", creativeIdea };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Internal server error",
      details: err.toString(),
    };
  }
});

//B + C = A
router.post("/api/generate_a", async (ctx) => {
  try {
    const { elementB, elementC } = await ctx.request.body().value;
    const prompt = `Given the result '${elementC}' and one component '${elementB}', what could be the missing element that combined with '${elementB}' results in '${elementC}'?`;
    const missingElement = await gptPrompt(prompt, {
      max_tokens: 500,
      temperature: 0.6,
    });
    ctx.response.body = {
      message: "Missing element generated",
      missingElement,
    };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Internal server error",
      details: err.toString(),
    };
  }
});

//A + C = B
router.post("/api/generate_b", async (ctx) => {
  try {
    const { elementA, elementC } = await ctx.request.body().value;
    const prompt = `Given the result '${elementC}' and one component '${elementA}', what could be the missing element that combined with '${elementA}' results in '${elementC}'?`;
    const missingElement = await gptPrompt(prompt, {
      max_tokens: 500,
      temperature: 0.6,
    });
    ctx.response.body = {
      message: "Missing element generated",
      missingElement,
    };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Internal server error",
      details: err.toString(),
    };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticServer);

const PORT = 8000;
console.log(chalk.green(`\nListening on http://localhost:${PORT}`));
await app.listen({ port: PORT, signal: createExitSignal() });
