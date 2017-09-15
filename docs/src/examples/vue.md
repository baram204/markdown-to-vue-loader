# Vue code blocks

> Vue code block will be loaded as a Vue component by default.

```vue
<template>
  <div class="vue-code-block">{{ message }}</div>
</template>

<script>
  export default {
    data() {
      return {
        message: 'This is a code block of Vue component.',
      };
    },
  };
</script>

<style>
  .vue-code-block {
    margin-bottom: 1rem;
  }
</style>
```

<!-- no-vue-component -->

```vue
<template>
  <div class="vue-code-block">This is a code block of Vue component too, but will not be loaded as a Vue component because of the predefined <code>&lt;!-- vue-component --&gt;</code> comment.</div>
</template>
```
