<script lang="ts">
  import { onMount } from 'svelte';
  import { SimpleMath } from './SimpleMath';
  import { Replacer } from './Replacer';
//  import aa from './lesson.html';
  import { content } from './assets/lesson';
  
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

  const tmp = `[{\"text\":\"<div>16 = 2&nbsp;&middot; 8 = 2&nbsp;&middot; 2&nbsp;&middot; 4 = 2 &middot; 2&nbsp;&middot; 2&nbsp;&middot; 2<\\/div>\\n\\n<div>&nbsp;<\\/div>\\n\\n<div>16 best&aring;r av 4 primtalsfaktorer.&nbsp;<\\/div>\"}]`;
  const solution = JSON.parse(tmp)[0].text;

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

    {@html lesson}
    {@html solution}
    <!-- {renderMath("x = \\frac{t}{3}")}
    {renderMath("x = ((5 * 3)^(2*3))/3")}
     -->
  </div>
</main>

<style>
</style>