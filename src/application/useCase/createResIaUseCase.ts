import { CreateResRepo } from "@/domain/repositories/resBibleIaRepo";
import { streamText } from "ai";
import { xai } from "@ai-sdk/xai";
export async function* CreateResIaUseCase(
    repo: CreateResRepo,
    userId: string,
    perguntaHash: string,
    systemPrompt: string,
    messageUser: string): AsyncGenerator<string> {
    const stream = streamText({
        model: xai("grok-3-beta"),
        system: systemPrompt,
        prompt: messageUser,
        temperature: 0,
    });

    let fullResponse = '';
    for await (const chunk of stream.textStream) {
        fullResponse += chunk
        yield chunk // retorna cada chunk pro controller
    }

    await repo.saveResponse(
        {
            userId,
            fullResponse,
            perguntaHash
        }
    )
}