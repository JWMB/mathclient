<script lang="ts">
  import { onMount } from "svelte";
  import LineInput from "./MathSingleLineInput.svelte";
//   import * as monaco from 'monaco-editor';
//   import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import { renderExpression } from "../MathTools";
  import { OpenAIClient, AzureKeyCredential, type ChatMessage } from "@azure/openai";

//   import type { SvelteComponent, SvelteComponentTyped } from 'svelte';
//   let components: [typeof SvelteComponent, Record<string, any>][] = [
//         [LineInput, { content: 'Initial', add:() => console.log("Add") }],
//         [LineInput, { content: 'blue', add:() => console.log("Add") }],
//     ];
//     function add<T extends typeof SvelteComponentTyped<P, any, any>, P>(
//         component: T,
//         props: P
//     ) {
//         components = [...components, [component, props]];
//         console.log(components);
//     }

    // type Row = { value: string};
    // let rows: Row[] = [{ value: ""}];
    // const addRow = (index: number, value?: string) => {
    //     if (value == null)
    //         value = rows[index - 1].value;
    //     rows.splice(index, 0, { value: value});
    //     rows = rows;
    // }
    // const removeRow = (index: number) => {
    //     if (rows.length == 1) return;
    //     rows.splice(index, 1);
    //     rows = rows;
    //     // TODO: how to get ref to other component so we can focus() on it?
    // }

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
Each step should be a simplification of the previous step.
Do NOT provide the full solution.
Please respond in Swedish.
---
${content}
---
        `.trim();
        console.log("content", prompt);
        evaluation = "...";
        const result = await client.getChatCompletions("GPT4-8k", [<ChatMessage>{ role: "assistant", content: prompt }]);
        evaluation = result.choices[0].message.content;
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

<!-- <button type=button on:click={() => add(LineInput, { content: 'Added' })}>
    Add
</button>
{#each components as [component, props]}
<svelte:component this={component} {...props} add={console.log("aaa")} >
    (Slotted content)
</svelte:component>
{/each} -->

    <!-- {#each rows as row, i}
    <div>
        <LineInput content={row} on:add={() => addRow(i + 1)} on:remove={() => removeRow(i)}></LineInput>
    </div>
    {/each} -->
    <!-- <div id="editor"></div> -->
    <div class="grid-container">
        <div bind:this={editorContainer} />
        <div>
            {#each lines as line}
            <div class="grid-item">{@html renderExpression(line)}</div>
            {/each}
        </div>
    </div>
    <button on:click={evaluate}>Evaluate</button>
    <div style="background-color:azure">{evaluation}</div>
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