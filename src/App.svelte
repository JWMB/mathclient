<script lang="ts">
  import { onMount } from 'svelte';
  import { SimpleMath } from './SimpleMath';
  import { Replacer } from './Replacer';
  import { lessonPlan, solution } from './assets/lesson';
  
  let expression: string = "";
  
  type NodeT<T> = { children: NodeT<T>[], data: T };
  type XData = { title: string, id?: number, content?: string };
  type XNode = NodeT<XData>;
  const tableOfContent =  <XNode>{ data: { title: "Table of Content"}, children: lessonPlan.content.chapters.map(chapter => {
    return <XNode>{ data: { title: chapter.name }, children: chapter.parts.map(part => { 
      return <XNode>{ data: { title: part.name }, children: part.subParts.map(subpart => { 
        return <XNode>{ data: { title: subpart.name }, children: subpart.sections.map(section => {
          return <XNode>{ data: { title: section.name }, children: [] };
        }) };
      })};
    })};
  })};

  const recToHtml = (node: XNode) => {
    const xx = (s: string) => {
      return s; //`<input type="checkbox" name="item1"><label for="item1">${s}</label>`;
    }
    if (node.data.title.trim() == "") return null;
    const title = xx(node.data.title);
    if (node.children?.length) {
      return `${title}<ul class="item-list">${node.children.map(c => recToHtml(c)).filter(c => c != null).map(c => `<li class="item">${c}</li>`).join("")}</ul>`;
    }
    return title;
  }

  const handleAssignment = (str: string) => {
    return str.replace(/\[vektorAssignment([^\]]+)\](.+?)\[\/vektorAssignment\]/gm, (str: string, ...args:any[]) => { 
        const template = document.createElement("template");
        template.innerHTML =`<div ${args[0]}>${args[1]}</div>`;
        const el = template.content.querySelector("div");
        return `<div><i>${el.getAttribute("prefix") || ""}</i><b>${el.getAttribute("comment")}</b>${el.getAttribute("answer")}</div>`;
      })
  };
  const handleFakeTags = (str: string) => {
    str = str
      .replace(/\[(\/?)(vanstermarginal)\]/g, "<$1h4>")
      .replace(/\[(\/?)(vektorExample)\]/g, "<$1ul>")
      .replace(/\[(\/?)(vektorExampleRow)\]/g, "<$1li>")
      .replace(/src=\"\/([^\""]+)/g, "src=\"https://files.matematik.nokportalen.se/public/$1");
    return handleAssignment(str);
  };

  const chapter = lessonPlan.content.chapters.find(o => o.name == "Procent");

  const part = chapter.parts.find(o => o.name == "Procent och procentenheter");
  const subpart = part.subParts.find(o => o.name == "Procent och procentenheter");
  const section = subpart.sections[0];
  const lessonBody = handleFakeTags(section.lesson.body);

  // const aaa = '[vektorAssignment prefix=\"a)\" answer=\"`7 - 5 = 2`<br><br>Svar: Ökningen är 2 procentenheter.\" comment=\"Procentenheter är skillnaden mellan antalet procent.\" toggle=\"true\"] procentenheter [/vektorAssignment]';
  // console.log(aaa.replace(/\[(\/?)(vektorAssignment[^\]]*)\]/g, ""));

  const lesson = Replacer.replaceWrapped(lessonBody, 
    s => SimpleMath.parseMath(s), 
    s => s);

  $: renderedExpression = SimpleMath.parseMath(expression);

  //console.log("asdasd", recToHtml(tableOfContent));
  onMount(() => {
    // insertMathJaxScript();
  });
</script>

<main>
    <div class="sidenav">
      {@html recToHtml(tableOfContent)}
    </div>
    <div class="pageContent">
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

<style global type="text/scss">

.sidenav {
  height: 100%; /* 100% Full-height */
  width: 280px; /* 0 width - change this with JavaScript */
  position: fixed; /* Stay in place */
  z-index: 1; /* Stay on top */
  top: 0; /* Stay at the top */
  left: 0;
  background-color: #eee;
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 6px; /* Place content 60px from the top */
  transition: 0.5s; /* 0.5 second transition effect to slide in the sidenav */
}
.pageContent {
  transition: margin-left .5s;
  padding: 20px;
}
// $list-identation: 1.2em;
// $list-between-spacing: 0.2em;
// $list-carret-character: '\f0da';


// body > ul {
//   border-left: 5px solid #DDD;
// }


// ul.tree-list{
  
//   font-family: 'Roboto', sans-serif;
  
//   li{
//     list-style: none;
//     padding: $list-between-spacing 0;
    
//     label{
//       display: inline-block;
//       margin-left: 0.5em;
//       padding: $list-between-spacing 0.3em;
//       border-radius: 0.2em;
//     }
    
//     > ul{
//       padding-left: $list-identation;
//       position: relative;
      
//       > li{
//         display: none;
//       }
      
//       &:before{
//         content: 0; /*$list-carret-character;*/
//         font-family: 'FontAwesome';
//         visibility: visible;
//         font-size: 14px;
//         position: absolute;
//         left: 0;
//         top: -1.45em;
//         transition: transform 0.3s;
//       } 
//     }
    
//     input{
//       width: 100%;
//       position: absolute;
//       cursor: pointer;
//       margin-top: 0.5em;
//       opacity: 0;
      
//       &:hover + label{
//         background-color:#EEE;
//       }

//       &:checked ~ ul{

//         &:before{
//           transform: rotate(90deg);
//         }
        
//         > li{
//           display:block;
//         }
//       }
//     }
//   }
// }
</style>