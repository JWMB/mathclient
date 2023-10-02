<script lang="ts">
  import { SimpleMath } from "../SimpleMath";
  import { ContentTools } from "../ContentTools";
  import type { Assignment } from "./AssignmentTypes";
  import Mexp from 'math-expression-evaluator' //'@types/math-expression-evaluator'
  import MultilineInput from "./MathMultiLineInput.svelte";

    export let assignment: Assignment;

    type Task = { question: string, answerType?: string, answer?: string[], fullAnswer?: string[], hints?: string };
    let tasks: Task[] = [];
    let alternatives: string[] = [];

    const process = (s: string) => {
      s = s
        .replace(/\[lucktext[^\]]*\]/g, '<input type="text"/>')
        .replace(/(\<br\s*\/?\>\s*)+$/, "");
      return ContentTools.process(s);
    }

    //assignment.template_data.suggestion
    const parseTasks = (ass: Assignment) => {
      const oxo: {q?: string, u?: string, v?: string, h?: string}[] = [];
      Object.keys(ass.template_data.settings).forEach(k => {
        const index = parseFloat(k.substring(1)) - 1;
        let found:any = oxo[index];
        if (found == null) {
          found = {};
          oxo[index] = found;
        }
        found[k.substring(0, 1)] = ass.template_data.settings[k];
      });
      tasks = oxo.filter(o => o.q || o.v).map(o => ({ question: process(o.q || o.v), answerType: o.u }))
      if (!tasks.length) { 
        tasks.push({question: "", answerType: "" });
       }
      // tasks[0] = { question: '`12/"-4"` =<br><br>', answerType: ''};
      // tasks[0] = { question: '`12/-4`', answerType: ''};
      const findSubtask = (subtask: string) => {
        if (!subtask) {
          return tasks.length == 1 ? tasks[0] : null;
        }
        const found = tasks.find(o => o.question.indexOf(subtask) == 0);
        if (found) return found;
        const index = subtask.substring(0,1).toLocaleUpperCase().charCodeAt(0) - 65;
        if (index >= 0 && index < tasks.length) return tasks[index];
        return null;
      };

      ass.solutions.forEach(sol => { 
        const found = findSubtask(sol.subtask);
        if (found) {
          found.fullAnswer = JSON.parse(sol.solutions).map(o => process(o["text"]));
          found.fullAnswer = found.fullAnswer.map(o => {
            if (o.match(/^\s*\<.+\>\s*$/s)) {
              var el = document.createElement("div");
              el.innerHTML = o;
              // const newFrag=document.createDocumentFragment();
              // newFrag.appendChild(el);
              const aa = [...el.getElementsByClassName("Wirisformula")][0];
              if (aa) {
                const ml = (aa.getAttribute("data-mathml") || "")
                  .replace(/«/g, "<")
                  .replace(/»/g, ">")
                  .replace(/§(#\d+;)/g, "&$1");
                  //.replace(/§#160;/g, "");
                return ml;
              }
              // console.log(o);
            }
            return o;
          });
          found.answer = JSON.parse(sol.answers).map(o => process(o["text"]));
        }
      });
      ass.hints.forEach(hint => { 
        const found = findSubtask(hint.subtask);
        if (found) {
          found.hints = JSON.parse(hint.hints).map(o => process(o["text"])); // "edit"
        }
      });
      // settings: {no_answer_button: 'true'}

      alternatives = [];
      const responseType: string = assignment.template_data.responseType; // multiple absolute checkbox show
      if (assignment.template_data.respons?.length) {
        const tmp = assignment.template_data.respons.map(o => typeof o == "string" ? o : o.value);
        // console.log(tmp);
        alternatives = tmp
          .map(o => process(o))
          .map(o => {
            let add = "";
            if (responseType == "multiple") {
              add = '<input type="checkbox"/>';
            } else if (responseType == "checkbox") {
              add = '<input type="checkbox"/>';
            }
            return `${o}${add}`;
          });
        // [fraction before="a)" after="=5" num="" den="-3"]
        // '`C` Endast en av täljaren eller nämnaren är ett negativt tal.'
      }
      console.log("assignment", assignment, tasks, alternatives);
    };

    $: parseTasks(assignment);

    // type Answer = { answer: string, expanded: string, hint: string };

    let mathExpr: string = "(9 + (5 * 3))^2";
    const calculateExpression = (expression: string) => {
      if (expression == null || expression.length == 0) return "";
      const mexp = new Mexp();
      try {
        const lexed = mexp.lex(expression, []);
        const postfixed = mexp.toPostfix(lexed);  
        return mexp.postfixEval(postfixed, {});  
      } catch (err) {
        // console.warn("math parse", err);
        return "??"; //err;
      }
    };
    $: renderedExpression = SimpleMath.parseMath(`${mathExpr} = ${calculateExpression(mathExpr)}`);

</script>

<div>
Expression evaluator: <input type="text" bind:value={mathExpr} />
{@html renderedExpression}

<!-- {@html SimpleMath.parseMath("1 * (a + (5 * 3)) = 2")} -->
<!-- {@html SimpleMath.parseMath("sum_(i=1)^n i^3=((n(n+1))/2)^2 * 2")} -->

<br/>

{#if assignment.template_data.illustration}
<img alt="img" style="width:25%" src={assignment.template_data.illustration}/>
{/if}
{@html process(assignment.template_data.text)}
{#if assignment.template_data.responseType == "absolute" && assignment.template_data.settings == ""}
<MultilineInput></MultilineInput>
{/if}
{#each tasks as task}
  <p>
    {@html task.question}
  </p>
  {#if task.hints}
  <div style="font-size:small">
    Hint: {@html task.hints[0]}
  </div>
  {/if}
  {#if task.answer}
    Answer: {@html task.answer[0]}
    {/if}
    {#if task.fullAnswer}
    FullAnswer: {@html task.fullAnswer[0]}
  {/if}
{/each}
{#each alternatives as alt}
<div>
  Alt: {@html alt}
  <br/>
  <br/>
</div>
{/each}
<button>Submit</button>
</div>