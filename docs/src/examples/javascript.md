# JavaScript code blocks

> JavaScript code block will **NOT** be loaded as a Vue component by default.

```js
export default {
  template: '<p>This is a code block of JavaScript.</p>'
};
```

<!-- vue-component -->

```js
export default {
  template: '<p>This is a code block of JavaScript too, and will be loaded as a Vue component because of the predefined <code>&lt;!-- vue-component --&gt;</code> comment.</p>'
};
```
