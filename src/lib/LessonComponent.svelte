<script lang="ts">
  import { ContentTools } from "../ContentTools";

    export let rawLesson: string;

    $: lesson = ContentTools.process(rawLesson);
</script>

<div>
    {@html lesson}
</div>