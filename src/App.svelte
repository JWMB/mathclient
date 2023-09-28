<script lang="ts">
  import { onMount } from 'svelte';
  import { SimpleMath } from './SimpleMath';
  import { lessonPlan, someAssignment } from './assets/lesson';
  import type { NodeT } from 'src/Node';
  import Branch from './lib/tree/Branch.svelte';
  import type { Assignment, AssignmentRoot } from './lib/AssignmentTypes';
  import AssignmentComponent from './lib/AssignmentComponent.svelte';
  import { ContentTools } from './ContentTools';

  let expression: string = "";
  
  enum NodeType {
    Chapter,
    Part,
    Subpart,
    Section
  }

  const decodeHtml = (html: string) => {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  let assignment: Assignment; // = (<AssignmentRoot>someAssignment).subpart[0].assignments[0];
  let auth: string;

  // someAssignment.subpart[0].assignments[0].assignment_content.templateData
  type XData = { title: string, type: NodeType, id?: number, hierarchyID?: number, content?: string };
  type XNode = NodeT<XData>;
  const tableOfContent =  <XNode>{ data: { title: "Table of Content"}, children: lessonPlan.content.chapters.map(chapter => {
    return <XNode>{ data: { title: chapter.name, type: NodeType.Chapter }, children: chapter.parts.map(part => { 
      return <XNode>{ data: { title: part.name, type: NodeType.Part }, children: part.subParts.map(subpart => { 
        return <XNode>{ data: { title: subpart.name, type: NodeType.Subpart, hierarchyID: subpart.hierarchyID }, children: subpart.sections.map(section => {
          return <XNode>{ data: { title: decodeHtml(section.name), type: NodeType.Section, hierarchyID: section.pivot.hierarchy_id, content: section.lesson.body }, children: [] };
        }) };
      })};
    })};
  })};

  const findNode = (parent: XNode, check: (node: XNode) => boolean) => {
    //if (parent.data.title == title) return parent;
    for (const c of parent.children) {
      if (check(c)) return c;
    }
    for (const c of parent.children) {
      const found = findNode(c, check);
      if (found) return found;
    }
    return null;
  }

  let lesson: string = "";
  const loadSection = (section: string) => {
    lesson = ContentTools.process(section);
  }

  const startNode = findNode(tableOfContent, (node) => node.data.type == NodeType.Section && node.data.title == "Enheter för area & areaomvandlingar");
  if (startNode != null && startNode.data.content != null) {
    loadSection(startNode.data.content);
  } else {
    console.log("couldn't find startNode");
    const chapter = lessonPlan.content.chapters.find(o => o.name == "Procent");
    const part = chapter.parts.find(o => o.name == "Procent och procentenheter");
    const subpart = part.subParts.find(o => o.name == "Procent och procentenheter");
    const section = subpart.sections[0];
    loadSection(section.lesson.body);
  }


  let currentNode: XNode;
  const onClick = (node: XNode) => {
    currentNode = node;
    if (node.data.content) {
      loadSection(node.data.content);
    }
    if ((node.data.type == NodeType.Section || node.data.type == NodeType.Subpart) && node.data.hierarchyID) { // Subpart
      fetchIt(node.data.hierarchyID);
    }
  }

  $: renderedExpression = SimpleMath.parseMath(expression);

  onMount(() => {
  });

  const fetchIt = async (hierarchyId: number, assignmentId?: number) => {
    const courseId = 2982;
    if (!auth) {
      console.warn("No auth");
      return;
    }

    // https://api.matematik.nokportalen.se/api/v2/assignment/subpart?hierarchyId=3010&assignmentId=24436&courseId=2982
    let url = `https://localhost:7134/api/v2/assignment/subpart?courseId=${courseId}`;
    if (assignmentId) { url += `&assignmentId=${assignmentId}`; }
    if (hierarchyId) { url += `&hierarchyId=${hierarchyId}`; }

    // console.log(url);
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      mode: "cors",
      headers: {
        "Authorization": auth,
        "Accept": "application/json, text/plain, */*",
        "X-Destination": "api.matematik.nokportalen.se"
      }
    });
    if (response.ok) {
      const json = await response.json();
      const assignments = json["subpart"][0]["assignments"];
      if (!assignments) {
        console.log("No assignments");
        return;
      }
      assignment = assignmentId ? assignments.filter(o => o["assignmentID"] == assignmentId) : assignments[0];
    }
  }
</script>

<main>
    <div class="sidenav">
      <Branch node={tableOfContent} getName={n => n.title} expanded={true} onClick={onClick} ></Branch>
      <!-- {@html recToHtml(tableOfContent)} -->
    </div>
    <div class="pageContent">
      <input type=text bind:value={auth}/> 
      {#if assignment}
      <!-- <AssignmentComponent assignment={assignment}></AssignmentComponent> -->
      <div class="wrap-collabsible">
        <input id="collapsible" class="toggle" type="checkbox">
        <label for="collapsible" class="lbl-toggle">Exercises</label>
        <div class="collapsible-content">
          <div class="content-inner">
            <AssignmentComponent assignment={assignment}></AssignmentComponent>
          </div>
        </div>
      </div>
      {/if}
      {@html lesson}
      <!-- {renderMath("x = \\frac{t}{3}")}
      {renderMath("x = ((5 * 3)^(2*3))/3")}
       -->
       <input type="text" bind:value={expression} />
       {@html renderedExpression}
   
       <!-- {@html SimpleMath.parseMath("1 xx (a + (5 * 3)) = 2")} -->
       {@html SimpleMath.parseMath("sum_(i=1)^n i^3=((n(n+1))/2)^2 * 2")}
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

input[type='checkbox'] { display: none; } 
.wrap-collabsible { margin: 1.2rem 0; } 
.lbl-toggle { display: block; font-weight: bold; font-family: monospace; font-size: 1.2rem; text-transform: uppercase; text-align: center; padding: 1rem; color: #DDD; background: #0069ff; 
cursor: pointer; border-radius: 7px; transition: all 0.25s ease-out; } 
.lbl-toggle:hover { color: #FFF; } 
.lbl-toggle::before { content: ' '; display: inline-block; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 5px solid currentColor; vertical-align: middle; margin-right: .7rem; transform: translateY(-2px); transition: transform .2s ease-out; } 
.toggle:checked+.lbl-toggle::before { transform: rotate(90deg) translateX(-3px); } 
.collapsible-content { max-height: 0px; overflow: hidden; transition: max-height .25s ease-in-out; } 
.toggle:checked + .lbl-toggle + .collapsible-content { max-height: 350px; } 
.toggle:checked+.lbl-toggle { border-bottom-right-radius: 0; border-bottom-left-radius: 0; } 
.collapsible-content .content-inner { background: rgba(0, 105, 255, .1); border-bottom: 1px solid rgba(0, 105, 255, .45); border-bottom-left-radius: 7px; border-bottom-right-radius: 7px; padding: .5rem 1rem; } 
.collapsible-content p { margin-bottom: 0; }
</style>