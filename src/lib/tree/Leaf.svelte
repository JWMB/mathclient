<script lang="ts" generics="T">
    import type { NodeT } from 'src/Node';
    
    // export let node: NodeT<T>;
    // export let onClick: (node: NodeT<T>) => void; 
    export let name: string;

    // $: type = name.slice(name.lastIndexOf('.') + 1);
</script>
    
<span>{name}</span>
<!-- style="background-image: url(/tutorial/icons/{type}.svg)" -->
    
<style>
    span {
        padding: 0 0 0 1.5em;
        background: 0 0.1em no-repeat;
        background-size: 1em 1em;
    }
</style>
