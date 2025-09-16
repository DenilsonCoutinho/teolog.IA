import { streamText } from "ai";
import { devotionalBibleRepo } from "../repositories/devotionalBibleRepo";
import { xai } from "@ai-sdk/xai";
import { systemPromptDevotional, userPrompt } from "@/prompts/prompt";

export async function* CreateDevotionalIaUseCase(
    repo: devotionalBibleRepo,
    date: Date,
): AsyncGenerator<string> {
    const stream = streamText({
        model: xai("grok-3-beta"),
        system: systemPromptDevotional,
        prompt: userPrompt,
        temperature: 0,
    });
    let fullResponse = '';
    for await (const chunk of stream.textStream) {
        fullResponse += chunk
        yield chunk // retorna cada chunk pro controller
    }

    await repo.create(
        date,
        fullResponse
    )
}