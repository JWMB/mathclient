<script lang="ts">
  import LineInput from "./MathSingleLineInput.svelte";

//   import type { SvelteComponent, SvelteComponentTyped } from 'svelte';
//   let components: [typeof SvelteComponent, Record<string, any>][] = [
//         [LineInput, { content: 'Initial', add:() => console.log("Add") }],
//         [LineInput, { content: 'blue', add:() => console.log("Add") }],
//     ];
//     function add<T extends typeof SvelteComponentTyped<P, any, any>, P>(
//         component: T,
//         props: P
//     ) {
//         components = [...components, [component, props]];
//         console.log(components);
//     }

    type Row = { value: string};

    const addRow = (index: number, value?: string) => {
        if (value == null)
            value = rows[index - 1].value;
        rows.splice(index, 0, { value: value});
        rows = rows;
    }
    const removeRow = (index: number) => {
        if (rows.length == 1) return;
        rows.splice(index, 1);
        rows = rows;
        // TODO: how to get ref to other component so we can focus() on it?
    }

    let rows: Row[] = [{ value: ""}];
</script>

<div>

<!-- <button type=button on:click={() => add(LineInput, { content: 'Added' })}>
    Add
</button>
{#each components as [component, props]}
<svelte:component this={component} {...props} add={console.log("aaa")} > 
    (Slotted content)
</svelte:component>
{/each} -->

    {#each rows as row, i}
    <div>
        <LineInput content={row} on:add={() => addRow(i + 1)} on:remove={() => removeRow(i)}></LineInput>
    </div>
    {/each}
</div>