<template>
  <div class="app">
    <header class="navbar navbar-light navbar-expand-md">
      <nav class="container-fluid">
        <a class="navbar-brand" href="./">{{ pkg.name }}</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-collapse" aria-controls="navbar-collapse" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-end" id="navbar-collapse" role="navigation">
          <nav class="nav navbar-nav">
            <a class="nav-link" href="//github.com/xkeshi/markdown-to-vue-loader/blob/master/README.md">Docs</a>
            <a class="nav-link" href="//github.com/xkeshi/markdown-to-vue-loader" title="View the GitHub project">GitHub</a>
            <a class="nav-link" href="//github.com/xkeshi" title="About the team">About</a>
          </nav>
        </div>
      </nav>
    </header>
    <main>
      <div class="jumbotron bg-primary text-white">
        <h1>{{ pkg.name }} <small>v{{ pkg.version }}</small></h1>
        <p class="lead">{{ pkg.description }}</p>
      </div>
      <div class="container-fluid">
        <h2 class="mb-4">Examples</h2>
        <section class="row example">
          <pre class="col-lg-6 example__code"><code class="language-markdown" v-html="vue"></code></pre>
          <div class="col-lg-6 markdown-body example__demo">
            <example-vue></example-vue>
          </div>
        </section>
        <section class="row example">
          <pre class="col-lg-6 example__code"><code class="language-markdown" v-html="html"></code></pre>
          <div class="col-lg-6 markdown-body example__demo">
            <example-html></example-html>
          </div>
        </section>
        <section class="row example">
          <pre class="col-lg-6 example__code"><code class="language-markdown" v-html="javascript"></code></pre>
          <div class="col-lg-6 markdown-body example__demo">
            <example-javascript></example-javascript>
          </div>
        </section>
        <section class="row example">
          <pre class="col-lg-6 example__code"><code class="language-markdown" v-html="others"></code></pre>
          <div class="col-lg-6 markdown-body example__demo">
            <example-others></example-others>
          </div>
        </section>
      </div>
    </main>
    <footer></footer>
  </div>
</template>

<script>
  import ExampleVue from './examples/vue.md';
  import ExampleHtml from './examples/html.md';
  import ExampleJavascript from './examples/javascript.md';
  import ExampleOthers from './examples/others.md';
  import pkg from '../../package.json';

  export default {
    components: {
      ExampleVue,
      ExampleHtml,
      ExampleJavascript,
      ExampleOthers,
    },

    data: () => ({
      pkg,
      vue: ExampleVue.source,
      html: ExampleHtml.source,
      javascript: ExampleJavascript.source,
      others: ExampleOthers.source,
    }),
  };
</script>

<style>
  .jumbotron {
    border-radius: 0;
  }

  @block example {
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;

    & + .example {
      margin-top: -1px;
    }

     @element code {
      background-color: #f8f8f8;
      margin-bottom: 0;

      @media (min-width: 992px) {
        padding: 3rem 4rem;
      }
    }

    @element demo {
      @media (min-width: 992px) {
        padding: 1.5rem 4rem;
      }
    }
  }
</style>
