<script lang="ts">
  import { onMount } from "svelte";
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import { renderExpression } from "../MathTools";
  import { OpenAIClient, AzureKeyCredential, type ChatMessage } from "@azure/openai";

    const client = new OpenAIClient(
        "https://open-ai-france.openai.azure.com/",
        new AzureKeyCredential(import.meta.env.VITE_OPENAI_KEY)
    );

    let evaluation: string = "(GPT 4 response goes here)";
    const evaluate = async () => {
        const input = lines; //rows.map(o => o.value);
        const content = input
            .map(o => o.trim())
            .filter(o => o.length)
            //.map((o, i) => `Step ${i + 1}: ${o}`)
            .join("\n => \n");
        const prompt = `
Analyze the following step-by-step calculations and point out any errors.
Each step should be a simplification of the previous step - make sure the user has simplified correctly and that the expressions are mathematically equal.
Do NOT provide the full solution.
Please respond in Swedish.
---
${content}
---
        `.trim();
        /*When you are writing mathematical formulas, please enclose them inside double quotes (").
For example, do not simply write 3+x=5 in the response, write it as "3+x=5".
*/
        console.log("content", prompt);
        evaluation = "...";
        const result = await client.getChatCompletions("GPT4-8k",
            [<ChatMessage>{ role: "assistant", content: prompt }], { temperature: 0 });
        // const result = { choices: [ { message: { content: "Analys av steg-för-steg-beräkningarna:\n\n((x * 4 - 7) / 3) ^ 3 = 27\n =\u003e \n((x * 4 - 7) / 3) = 9\n\nHär är det ett fel. Det borde vara ((x * 4 - 7) / 3) = 3, eftersom kubroten ur 27 är 3, inte 9."}}]};
        evaluation = result.choices[0].message.content.replace(/\n/gm, "<br/>");
    };

    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;
    const width = 400;
    let ignoreEvent = false;

    const updateHeight = () => {
        if (ignoreEvent) return;
        const contentHeight = Math.min(1000, editor.getContentHeight());
        editorContainer.style.width = `${width}px`;
        editorContainer.style.height = `${contentHeight}px`;
        try {
            ignoreEvent = true;
            editor.layout({ width, height: contentHeight });
        } finally {
            ignoreEvent = false;
        }
    };

    let lines: string[] = [];
    onMount(async () => {
        monaco = (await import('../monaco')).default;

        editor = monaco.editor.create(editorContainer, {
            scrollBeyondLastLine: false,
            lineHeight: 40,
            fontSize: 18,
            minimap: {
                enabled: false
            }
        });
        const model = monaco.editor.createModel(
            "", // "(x + 1) ^2 = 1",
            'math'
        );
        editor.setModel(model);

        editor.onDidContentSizeChange(updateHeight);
        editor.onDidChangeModelContent((e) => {
            lines = model.getLinesContent();
        });
        updateHeight();
    });

</script>

<div>
    <div class="grid-container">
        <div bind:this={editorContainer} />
        <div>
            {#each lines as line}
            <div class="grid-item">{@html renderExpression(line)}</div>
            {/each}
        </div>
    </div>
    <button on:click={evaluate}>Evaluate</button>
    <div style="background-color:azure">{@html evaluation}</div>
</div>

<style>
    .grid-container {
        display: grid;
        grid-template-columns: 400px auto;
        background-color: #2196F3;
        padding: 5px;
    }
    .grid-item {
        background-color: rgba(255, 255, 255, 0.8);
        /* border: 1px solid rgba(0, 0, 0, 0.8);
        padding: 2px; */
        text-align: left;
        height: 40px;
    }
</style>