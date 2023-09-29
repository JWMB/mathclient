<script lang="ts">
    import AssignmentComponent from "./AssignmentComponent.svelte";
    import type { Assignment } from "./AssignmentTypes";
    export let assignments: Assignment[];

    let assignment: Assignment | null;
</script>

{#each assignments as a}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<button on:click={() => assignment = (assignment == a ? null : a)}>
    {a.title} ({a.level})
</button>
{/each}
{#if assignment}
<AssignmentComponent assignment={assignment}></AssignmentComponent>
{/if}