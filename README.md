# markdown-to-vue-loader [![npm package](https://img.shields.io/npm/v/markdown-to-vue-loader.svg?maxAge=2592000)](https://www.npmjs.com/package/markdown-to-vue-loader)

> Markdown to Vue component loader for [Webpack](https://webpack.js.org/).

- The built-in markdown parser is [**markdown-it**](https://github.com/markdown-it/markdown-it).
- [Examples](https://xkeshi.github.io/markdown-to-vue-loader).

## Features

- Supports to load a markdown file as a Vue component.
- Supports to load code blocks (Vue and HTML by default) as Vue components.
- Supports 8 [options](#options).

## Getting started

### Install

```bash
npm install markdown-to-vue-loader --save-dev
```

### Usage

Within your webpack configuration object, you'll need to add the **markdown-to-vue-loader** to the list of modules, like so:

```js
module: {
  rules: [
    {
      test: /\.md$/,
      exclude: /(node_modules|bower_components)/,
      use: [
        'vue-loader',
        {
          loader: 'markdown-to-vue-loader',
          options: {
            // ...
          },
        },
      ],
    },
  ],
}
```

## Options

### componentNamespace

- Type: `String`
- Default: `'component'`

Namespace for component name.

For example, if this is set to `'awesome-component'`, then given this input (`example.md`):

````markdown
# Example

```vue
<template>
  <p>Hello, World!</p>
</template>
```
````

will generate (`example.vue`):

```html
<template>
  <div>
    <h1>Example</h1>
    <awesome-component-example-0></awesome-component-example-0>
    <pre class="language-vue"><code>&lt;template&gt;
  &lt;p&gt;Hello, World!&lt;/p&gt;
&lt;/template&gt;</code></pre>
  </div>
</template>
<script>
  module.exports = {
    components: {
      'awesome-component-example-0': {
        template: '<p>Hello, World!</p>'
      }
    }
  };
</script>
```

### componentWrapper

- Type: `String`
- Default: `''`

Wrapper for a component content.

For example, if this is set to `'<section></section>'`, then given this input (`example.md`):

````markdown
# Example

```html
<p>Hello, World!</p>
```
````

will generate (`example.vue`):

```html
<template>
  <div>
    <h1>Example</h1>
    <section><component-example-0></component-example-0></section>
    <pre class="language-html"><code>&lt;p&gt;Hello, World!&lt;/p&gt;</code></pre>
  </div>
</template>
<script>
  module.exports = {
    components: {
      'component-example-0': {
        template: '<p>Hello, World!</p>'
      }
    }
  };
</script>
```

### exportSource

- Type: `Boolean`
- Default: `false`

Export source markdown text.

If this is set to `true`, then you can get the source from the Vue component's `source` property.

For example (`example.md`):

```markdown
# Hello, World!
```

```js
import Example from 'example.md';

console.log(Example.source);
// > # Hello, World!
```

### languages

- Type: `Array`
- Default: `['vue', 'html']`

The code blocks of these languages will be loaded as Vue components be default.

For example, if this is set to `['js']`, then given this input (`example.md`):

````markdown
# Example

```js
export default {
  template: '<p>Hello, World!</p>'
}
```
````

will generate (`example.vue`):

```html
<template>
  <div>
    <h1>Example</h1>
    <component-example-0></component-example-0>
    <pre class="language-js"><code>export default {
  template: '&lt;p&gt;Hello, World!&lt;/p&gt;'
}</code></pre>
  </div>
</template>
<script>
  module.exports = {
    components: {
      'component-example-0': {
        template: '<p>Hello, World!</p>'
      }
    }
  };
</script>
```

### preClass

- Type: `String`
- Default: `''`
- Example: `'prettyprint'`

The class name for each `<pre></pre>` element.

### preWrapper

- Type: `String`
- Default: `''`
- Example: `'<div class="example-code"></div>'`

The wrapper for each `<pre></pre>` element.

### tableClass

- Type: `String`
- Default: `''`
- Example: `'table table-bordered border-striped'`

The class name for each `<table></table>` element.

### tableWrapper

- Type: `String`
- Default: `''`
- Example: `'<div class="table-container"></div>'`

The wrapper for each `<table></table>` element.

## Inline comment options

- `<!-- vue-component -->`
- `<!-- no-vue-component -->`

If a code block has a `<!-- vue-component -->` comment before it, then the loader will load it as a Vue component, even though its language is **NOT** specified in the [`languages`](#languages) option.

Conversely, if a code block has a `<!-- no-vue-component -->` comment before it, then the loader will **NOT** load it as a Vue component, even though its language is specified in the [`languages`](#languages) option.

For example, given this input (`example.md`):

````markdown
# Example

<!-- vue-component -->

```js
export default {
  template: '<p>Hello, World!</p>'
};
```

<!-- no-vue-component -->

```vue
<template>
  <p>Hello, World!</p>
</template>
```
````

will generate (`example.vue`):

```html
<template>
  <div>
    <h1>Example</h1>
    <component-example-0></component-example-0>
    <pre class="language-js"><code>export default {
  template: '&lt;p&gt;Hello, World!&lt;/p&gt;'
};</code></pre>
    <pre class="language-vue"><code>&lt;template&gt;
  &lt;p&gt;Hello, World!&lt;/p&gt;
&lt;/template&gt;</code></pre>
  </div>
</template>
<script>
  module.exports = {
    components: {
      'component-example-0': {
        template: '<p>Hello, World!</p>'
      }
    }
  };
</script>
```


## Versioning

Maintained under the [Semantic Versioning guidelines](http://semver.org).

## License

[MIT](http://opensource.org/licenses/MIT) © [Xkeshi](http://xkeshi.com)
