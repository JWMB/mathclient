<script lang="ts">
  import { onMount } from 'svelte';
  import Branch from './lib/tree/Branch.svelte';
  import type { Assignment } from './lib/AssignmentTypes';
  import Assignments from './lib/Assignments.svelte';
  import LessonComponent from './lib/LessonComponent.svelte';
  import { apiStore } from './globalStore';
  import { NodeType, type XNode } from './ApiFacade';
  import { getAncestors, getLeaves } from './Node';
  

  let assignments: Assignment[];
  let auth: string;

  let lesson: string = "";

  let tableOfContent: XNode;
  let currentNode: XNode;

  const getCurrentHierarchyId = () => {
    if (!currentNode) return null;
    if ((currentNode.data.type == NodeType.Section || currentNode.data.type == NodeType.Subpart) && currentNode.data.hierarchyID)  // Subpart
      return currentNode.data.hierarchyID;
    return null;
  };

  const selectNode = (node: XNode) => {
    currentNode = node;
    if (node.data.content) {
      lesson = node.data.content;
    }
    const hId = getCurrentHierarchyId();
    if (hId) fetchAssignments();
  }

  const onClick = (node: XNode) => selectNode(node);

  onMount(async () => {
    await reauth("");
  });

  const reauth = async (a: string) => {
    await apiStore.refresh(a);
    await fetchCourses();
    await fetchAssignments();
  }

  $: reauth(auth);

  let loadedActualCourses = false;

  const fetchCourses = async () => {
    tableOfContent = null;
      const courseIds = [2846, 2982, 3126, 16961];
      let root = await apiStore.getCourses(courseIds);
      if (!root.children.length) {
        root = await apiStore.getCourses([courseIds[0]], true);
      } else {
        loadedActualCourses = true;
      }
      tableOfContent = root;

      const leaf = getLeaves(tableOfContent)[0];
      if (leaf) {
        selectNode(leaf);
      }
  };

  const fetchAssignments = async (hierarchyId?: number, assignmentId?: number) => {
    if (!tableOfContent) return;
    if (!hierarchyId) {
      hierarchyId = getCurrentHierarchyId() || getLeaves(tableOfContent)[0]?.data.hierarchyID;
    }
    if (hierarchyId) {
      const courseId = getAncestors(currentNode).find(o => o.data.type == NodeType.Course)?.data.id;
      if (courseId) {
        assignments = await apiStore.getAssignments(courseId, hierarchyId, assignmentId);
      } else {
        console.log(getAncestors(currentNode));
      }
    }
  }
</script>

<main>
    <div class="sidenav">
      {#if tableOfContent}
      <Branch node={tableOfContent} getName={n => n.title} expanded={true} onClick={onClick} ></Branch>
      {/if}
    </div>

    <div class="pageContent">
      Auth: <input type=text bind:value={auth}/> 

      {#if assignments?.length}
      <div style="background-color: bisque;">
        <Assignments assignments={assignments}></Assignments>
      </div>
      {/if}

      {#if lesson}
      <LessonComponent rawLesson={lesson}></LessonComponent>
      {/if}
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
</style>