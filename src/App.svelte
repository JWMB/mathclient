<script lang="ts">
  import { onMount } from 'svelte';
  import { SimpleMath } from './SimpleMath';
  import { Replacer } from './Replacer';
  import { content, solution } from './assets/lesson';
  
  let expression: string = "";
  
  const chapter = content.content.chapters.find(o => o.name == "Procent");

  const part = chapter.parts.find(o => o.name == "Procent och procentenheter");
  const subpart = part.subParts.find(o => o.name == "Procent och procentenheter");
  const section = subpart.sections[0];
  const lessonBody = section.lesson.body;

  const lesson = Replacer.replaceWrapped(lessonBody, 
    s => SimpleMath.parseMath(s), 
    s => s.replace(/\[(\/?)(vanstermarginal)\]/g, "<$1h4>")); // s.replace(/\[\/?vanstermarginal\]/g, "<br/>")
  // lesson = lesson
  //   .replace(/`/g, "$$")
  //   .replace(/\[\/?vanstermarginal\]/g, "<br/>")
  //   .replace(/text\{.\}/g, "-")
  //   .replace(/\^(\(.[^)]+\))/g, "^{$1}")
  //   .replace(/\*/g, "\\times");

  $: renderedExpression = SimpleMath.parseMath(expression);

  onMount(() => {
    // insertMathJaxScript();
  });
</script>

<main>
  <div>
    <input type="text" bind:value={expression} />
    {@html renderedExpression}

    <!-- {@html SimpleMath.parseMath("1 xx (a + (5 * 3)) = 2")} -->
    {@html SimpleMath.parseMath("sum_(i=1)^n i^3=((n(n+1))/2)^2 * 2")}
    {@html solution[0].text}

    {@html lesson}
    <!-- {renderMath("x = \\frac{t}{3}")}
    {renderMath("x = ((5 * 3)^(2*3))/3")}
     -->
  </div>
</main>

<style>
</style>