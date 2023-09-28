<script lang="ts" generics="T">
    import type { NodeT } from 'src/Node';
    // import Leaf from './Leaf.svelte';

    export let expanded: boolean = false;
    export let getName: (item: T) => string;
    export let onClick: (node: NodeT<T>) => void = (n) => {};
    export let node: NodeT<T>;

    function toggle() {
        expanded = !expanded;
        onClick(node);
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span class:expanded on:click={toggle}>{getName(node.data)}</span>

{#if expanded}
    <ul>
        {#each node.children as branch}
            <li>
                {#if branch.children.length}
                    <svelte:self node={branch} onClick={onClick} getName={getName}/>
                {:else}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <span style="font-weight:normal" on:click={() => onClick(branch)}>{getName(branch.data)}</span>
                    <!-- <Leafname={getName(branch.data)}/> -->
                {/if}
            </li>
        {/each}
    </ul>
{/if}

<style>
    span {
        padding: 0 0 0 1.5em;
        /* background: url(/tutorial/icons/folder.svg) 0 0.1em no-repeat; */
        background-size: 1em 1em;
        font-weight: bold;
        cursor: pointer;
    }

    .expanded {
        /* background-image: url(/tutorial/icons/folder-open.svg); */
    }

    ul {
        padding: 0.2em 0 0 0.5em;
        margin: 0 0 0 0.5em;
        list-style: none;
        border-left: 1px solid #eee;
    }

    li {
        padding: 0.2em 0;
    }
</style>
