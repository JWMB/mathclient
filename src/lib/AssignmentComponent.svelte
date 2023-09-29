<script lang="ts">
  import { ContentTools } from "../ContentTools";
  import type { Assignment } from "./AssignmentTypes";
  import Mexp from 'math-expression-evaluator' //'@types/math-expression-evaluator'

    export let assignment: Assignment;

    type Task = { question: string, answerType?: string, answer?: string[], fullAnswer?: string[], hints?: string };
    let tasks: Task[] = [];
    let alternatives: string[] = [];

    const process = (s: string) => {
      s = s.replace(/\[lucktext[^\]]*\]/g, '<input type="text"/>');
      return ContentTools.process(s);
    }
    // const zz = (s: string) => s.replace(/\[lucktext[^\]]*\]/g, '<input type="text"/>');

    //assignment.template_data.suggestion
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
          found.fullAnswer = JSON.parse(sol.solutions).map(o => process(o["text"]));
          found.answer = JSON.parse(sol.answers).map(o => process(o["text"]));
        }
      });
      ass.hints.forEach(hint => { 
        const found = tasks.find(o => o.question.indexOf(hint.subtask) == 0);
        if (found) {
          found.hints = JSON.parse(hint.hints).map(o => process(o["text"])); // "edit"
        }
      });
      console.log("assignment", assignment, tasks);

      // settings: {no_answer_button: 'true'}

      alternatives = [];
      const responseType: string = assignment.template_data.responseType; // multiple absolute checkbox show
      if (assignment.template_data.respons?.length) {
        const tmp = assignment.template_data.respons.map(o => typeof o == "string" ? o : o.value);
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
        // console.log(alternatives);
        // console.log(tmp, alternatives);
        // [fraction before="a)" after="=5" num="" den="-3"]
        // '`C` Endast en av täljaren eller nämnaren är ett negativt tal.'
      }
      // console.log("respons", assignment.template_data.respons, assignment.template_data.responseType) 
    };

    $: parseTasks(assignment);

    // type Answer = { answer: string, expanded: string, hint: string };

    let mathExpr: string = "";
    let mathExprEval: any;
    const xx = (expression: string) => {
      if (expression == null || expression.length == 0) return "";
      const mexp = new Mexp(); //new (<any>window).Mexp;
      try {
        const lexed = mexp.lex(expression, []);
        const postfixed = mexp.toPostfix(lexed);  
        return mexp.postfixEval(postfixed, {});  
      } catch (err) {
        // console.warn("math parse", err);
        return "??"; //err;
      }
    };
    $: mathExprEval = xx(mathExpr);
</script>

<div>
Expression evaluator: <input type="text" bind:value={mathExpr} /> {mathExprEval}
<br/>

{#if assignment.template_data.illustration}
<img alt="img" style="width:25%" src={assignment.template_data.illustration}/>
{/if}
{@html process(assignment.template_data.text)}
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
{#each alternatives as alt}
<div>
  {@html alt}
  <br/>
  <br/>
</div>
{/each}
<button>Submit</button>
</div>