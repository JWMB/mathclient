<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { renderExpression } from "../MathTools";

    //export let content: string = "";
    export let content: { value: string} = { value: "" };

    const dispatch = createEventDispatcher();
    const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            dispatch("add");
        } else if (e.key === "Backspace" || e.key === "Delete") {
            if (!content.value.length) {
                dispatch("remove");
            }
        }
    }

    const init = (el: HTMLElement) => {el.focus();};
    $: renderedExpression = renderExpression(content.value); // SimpleMath.parseMath(`${content.value}`) + (content.value.indexOf("=") < 0 && calculateExpression(content.value) != "??" ? ` = ${calculateExpression(content.value)}` : ""); // = ${calculateExpression(content.value)}`);

</script>

<div>
    <input type="text" use:init on:keyup={onKey} bind:value={content.value}>
    {@html renderedExpression}
</div>
