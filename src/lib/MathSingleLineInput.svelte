<script lang="ts">
  import Mexp from "math-expression-evaluator";
  import { SimpleMath } from "../SimpleMath";
  import { createEventDispatcher } from "svelte";

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

    const calculateExpression = (expression: string) => {
      if (expression == null || expression.length == 0) return "";
      const mexp = new Mexp();
      try {
        const lexed = mexp.lex(expression, []);
        const postfixed = mexp.toPostfix(lexed);  
        return mexp.postfixEval(postfixed, {});  
      } catch (err) {
        return "??"; //err;
      }
    };

    const renderExpression = (expression: string) => {
      const parsed = SimpleMath.parseMath(expression);
      if (parsed.length && expression.trim().length && expression.indexOf("=") < 0) {
        const calculated = calculateExpression(expression);
        if (calculated != "??") {
          return `${parsed} = ${calculated}`;
        }
      }
      return parsed;
    };
    $: renderedExpression = renderExpression(content.value); // SimpleMath.parseMath(`${content.value}`) + (content.value.indexOf("=") < 0 && calculateExpression(content.value) != "??" ? ` = ${calculateExpression(content.value)}` : ""); // = ${calculateExpression(content.value)}`);

</script>

<div>
    <input type="text" use:init on:keyup={onKey} bind:value={content.value}>
    {@html renderedExpression}
</div>
