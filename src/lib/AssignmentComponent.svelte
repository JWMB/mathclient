<script lang="ts">
  import { ContentTools } from "../ContentTools";
  import type { Assignment } from "./AssignmentTypes";

    export let assignment: Assignment;

    type Task = { question: string, answerType?: string, answer?: string[], fullAnswer?: string[], hints?: string };
    let tasks: Task[] = [];

    const parseTasks = (ass: Assignment) => {
      const oxo: {q?: string, u?: string, v?: string}[] = [];
      Object.keys(ass.template_data.settings).forEach(k => {
        const index = parseFloat(k.substring(1)) - 1;
        let found:any = oxo[index];
        if (found == null) {
          found = {};
          oxo[index] = found;
        }
        found[k.substring(0, 1)] = ass.template_data.settings[k];
      });
      tasks = oxo.filter(o => o.q).map(o => ({ question: o.q, answerType: o.u }))

      ass.solutions.forEach(sol => { 
        const found = tasks.find(o => o.question.indexOf(sol.subtask) == 0);
        if (found) {
          found.fullAnswer = JSON.parse(sol.solutions).map(o => ContentTools.process(o["text"]));
          found.answer = JSON.parse(sol.answers).map(o => ContentTools.process(o["text"]));
        }
      });
      ass.hints.forEach(hint => { 
        const found = tasks.find(o => o.question.indexOf(hint.subtask) == 0);
        if (found) {
          found.hints = JSON.parse(hint.hints).map(o => ContentTools.process(o["text"])); // "edit"
        }
      });
      console.log(tasks);
    };

    $: parseTasks(assignment);

    // type Answer = { answer: string, expanded: string, hint: string };
</script>

<div>
{@html ContentTools.process(assignment.template_data.text)}
{#each tasks as task}
<p>
  Question: {@html task.question}
</p>
  {#if task.answer}
  Answer: {@html task.answer[0]}
  {/if}
  {#if task.fullAnswer}
  {@html task.fullAnswer[0]}
  {/if}
  {#if task.hints}
  <div style="font-size:small">
    Hint: {@html task.hints[0]}
  </div>
  {/if}
{/each}
</div>