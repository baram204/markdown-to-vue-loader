import cheerio from 'cheerio';
import loaderUtils from 'loader-utils';
import MarkdownIt from 'markdown-it';

const path = require('path');

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});
const defaultOptions = {
  componentNamespace: 'component',
  componentWrapper: '',
  exportSource: false,
  languages: ['vue', 'html'],
  preClass: '',
  preWrapper: '',
  tableClass: '',
  tableWrapper: '',
};

// RegExps
const REGEXP_HYPHENS_END = /-*$/;
const REGEXP_HYPHENS_START = /^-*/;
const REGEXP_LANGUAGE_PREFIXES = /lang(uage)-?/;
const REGEXP_MODULE_EXPORTS = /(?:export\s+default|(?:module\.)?exports\s*=)/g;
const REGEXP_NOT_WORDS = /\W/g;
const REGEXP_COMMENT_OPTIONS = /^(no-)?vue-component$/;

/**
 * Normalize script to valid VUe Component.
 * @param {string} script - The raw script code of component.
 * @param {string} mixin - The mixin to component.
 * @returns {string} The normalize component.
 */
function normalizeComponent(script, mixin) {
  return `(function () {
    var component = (function () {
      ${script.replace(REGEXP_MODULE_EXPORTS, 'return')}
    }());

    if (typeof component === 'function') {
      component = component();
    }

    if (typeof component !== 'object') {
      component = {};
    }

    component.mixins = (component.mixins || []).concat([${mixin}]);

    return component;
  }())`;
}

export default function markdownToVueLoader(source, map) {
  const options = Object.assign({}, defaultOptions, loaderUtils.getOptions(this));
  const $ = cheerio.load(markdown.render(source), {
    decodeEntities: true,
    lowerCaseTags: false,
  });
  const resourceName = path.basename(this.resourcePath, '.md');
  const normalizedResourceName = resourceName.toLowerCase().replace(REGEXP_NOT_WORDS, '-').replace(REGEXP_HYPHENS_START, '').replace(REGEXP_HYPHENS_END, '');
  const components = [];

  $('pre').each((index, pre) => {
    const $pre = $(pre);
    const componentName = [options.componentNamespace, normalizedResourceName, index].join('-');
    let commentNode = pre.previousSibling;
    let commentOption = '';

    while (commentNode) {
      const { nodeType } = commentNode;

      if (nodeType === 8) {
        commentOption = commentNode.data.trim();

        if (REGEXP_COMMENT_OPTIONS.test(commentOption)) {
          break;
        }
      }

      commentNode = (nodeType === 3 || nodeType === 8) ? commentNode.previousSibling : null;
    }

    if (commentOption !== 'no-vue-component') {
      $pre.children('code').each((i, code) => {
        const $code = $(code);
        const language = $code.attr('class').replace(REGEXP_LANGUAGE_PREFIXES, '');
        const mixin = [];
        let component;

        if (options.languages.indexOf(language) !== -1 || commentOption === 'vue-component') {
          switch (language) {
            case 'vue': {
              const $html = cheerio.load($code.text());
              const template = $html('template').html();
              const style = $html('style').html();

              component = $html('script').html() || 'module.exports = {};';

              if (template) {
                mixin.push(`template: ${JSON.stringify(template)}`);
              }

              if (style) {
                mixin.push(`beforeCreate: function () {
                  var style = document.createElement('style');
                  style.textContent = ${JSON.stringify(style)};
                  document.head.appendChild(style);
                  this.$styleInjectedByMarkdownToVueLoader = style;
                }`);
                mixin.push(`beforeDestroy: function () {
                  var $style = this.$styleInjectedByMarkdownToVueLoader;
                  $style.parentNode.removeChild($style);
                }`);
              }

              break;
            }

            case 'html': {
              const $html = cheerio.load($code.text());
              const $body = $html('body');
              const $script = $html('script');
              const $style = $html('style');
              const style = $style.html();

              component = $script.html() || 'module.exports = {};';

              $script.remove();
              $style.remove();
              $html('template').each((j, template) => {
                // <template> is child element of <head>, so move it to <body>
                $body.append($(template).html());
              });

              mixin.push(`template: ${JSON.stringify(`<div>${$body.html()}</div>`)}`);

              if (style) {
                mixin.push(`beforeCreate: function () {
                  var style = document.createElement('style');
                  style.textContent = ${JSON.stringify(style)};
                  document.head.appendChild(style);
                  this.$styleInjectedByMarkdownToVueLoader = style;
                }`);
                mixin.push(`beforeDestroy: function () {
                  var $style = this.$styleInjectedByMarkdownToVueLoader;
                  $style.parentNode.removeChild($style);
                }`);
              }

              break;
            }

            // case 'javascript':
            // case 'js':
            default:
              component = $code.text();
          }
        }

        if (component) {
          mixin.push(`name: ${JSON.stringify(componentName)}`);
          components.push(`${JSON.stringify(componentName)}: ${normalizeComponent(component, `{${mixin.join()}}`)}`);

          const $component = $(`<${componentName}></${componentName}>`);

          $pre.before($component);

          if (options.componentWrapper) {
            $component.wrap(options.componentWrapper);
          }
        }
      });
    }

    $pre.attr('v-pre', '');

    if (options.preClass) {
      $pre.addClass(options.preClass);
    }

    if (options.preWrapper) {
      $pre.wrap(options.preWrapper);
    }
  });

  $('table').each((i, table) => {
    const $table = $(table);

    if (options.tableClass) {
      $table.addClass(options.tableClass);
    }

    if (options.tableWrapper) {
      $table.wrap(options.tableWrapper);
    }
  });

  let output = `<template>
  <div>${$('body').html()}</div>
</template>`;

  if (options.exportSource || components.length > 0) {
    output += `<script>
  module.exports = {
    ${options.exportSource ? `source: ${JSON.stringify(markdown.utils.escapeHtml(source))},` : ''}
    ${components.length > 0 ? `components: {${components.join()}}` : ''}
  };
</script>`;
  }

  this.callback(null, output, map);
}
