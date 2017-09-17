/*!
 * Markdown To Vue Loader v0.1.1
 * https://github.com/xkeshi/markdown-to-vue-loader
 *
 * Copyright (c) 2017 Xkeshi
 * Released under the MIT license
 *
 * Date: 2017-09-17T07:21:44.260Z
 */

import cheerio from 'cheerio';
import loaderUtils from 'loader-utils';
import MarkdownIt from 'markdown-it';

var path = require('path');

var markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
var defaultOptions = {
  componentNamespace: 'component',
  componentWrapper: '',
  exportSource: false,
  languages: ['vue', 'html'],
  preClass: '',
  preWrapper: '',
  tableClass: '',
  tableWrapper: ''
};

// RegExps
var REGEXP_HYPHENS_END = /-*$/;
var REGEXP_HYPHENS_START = /^-*/;
var REGEXP_LANGUAGE_PREFIXES = /lang(uage)-?/;
var REGEXP_MODULE_EXPORTS = /(?:export\s+default|(?:module\.)?exports\s*=)/g;
var REGEXP_NOT_WORDS = /\W/g;
var REGEXP_COMMENT_OPTIONS = /^(no-)?vue-component$/;

/**
 * Normalize script to valid VUe Component.
 * @param {string} script - The raw script code of component.
 * @param {string} mixin - The mixin to component.
 * @returns {string} The normalize component.
 */
function normalizeComponent(script, mixin) {
  return '(function () {\n    var component = (function () {\n      ' + script.replace(REGEXP_MODULE_EXPORTS, 'return') + '\n    }());\n\n    if (typeof component === \'function\') {\n      component = component();\n    }\n\n    if (typeof component !== \'object\') {\n      component = {};\n    }\n\n    component.mixins = (component.mixins || []).concat([' + mixin + ']);\n\n    return component;\n  }())';
}

function markdownToVueLoader(source, map) {
  var options = Object.assign({}, defaultOptions, loaderUtils.getOptions(this));
  var $ = cheerio.load(markdown.render(source), {
    decodeEntities: true,
    lowerCaseTags: false
  });
  var resourceName = path.basename(this.resourcePath, '.md');
  var normalizedResourceName = resourceName.toLowerCase().replace(REGEXP_NOT_WORDS, '-').replace(REGEXP_HYPHENS_START, '').replace(REGEXP_HYPHENS_END, '');
  var components = [];

  $('pre').each(function (index, pre) {
    var $pre = $(pre);
    var componentName = [options.componentNamespace, normalizedResourceName, index].join('-');
    var commentNode = pre.previousSibling;
    var commentOption = '';

    while (commentNode) {
      var _commentNode = commentNode,
          nodeType = _commentNode.nodeType;


      if (nodeType === 8) {
        commentOption = commentNode.data.trim();

        if (REGEXP_COMMENT_OPTIONS.test(commentOption)) {
          break;
        }
      }

      commentNode = nodeType === 3 || nodeType === 8 ? commentNode.previousSibling : null;
    }

    if (commentOption !== 'no-vue-component') {
      $pre.children('code').each(function (i, code) {
        var $code = $(code);
        var language = $code.attr('class').replace(REGEXP_LANGUAGE_PREFIXES, '');
        var mixin = [];
        var component = void 0;

        if (options.languages.indexOf(language) !== -1 || commentOption === 'vue-component') {
          switch (language) {
            case 'vue':
              {
                var $html = cheerio.load($code.text());
                var template = $html('template').html();
                var style = $html('style').html();

                component = $html('script').html() || 'module.exports = {};';

                if (template) {
                  mixin.push('template: ' + JSON.stringify(template));
                }

                if (style) {
                  mixin.push('beforeCreate: function () {\n                  var style = document.createElement(\'style\');\n                  style.textContent = ' + JSON.stringify(style) + ';\n                  document.head.appendChild(style);\n                  this.$styleInjectedByMarkdownToVueLoader = style;\n                }');
                  mixin.push('beforeDestroy: function () {\n                  var $style = this.$styleInjectedByMarkdownToVueLoader;\n                  $style.parentNode.removeChild($style);\n                }');
                }

                break;
              }

            case 'html':
              {
                var _$html = cheerio.load($code.text());
                var $body = _$html('body');
                var $script = _$html('script');
                var $style = _$html('style');
                var _style = $style.html();

                component = $script.html() || 'module.exports = {};';

                $script.remove();
                $style.remove();

                // Move <template> from <head> to <body>
                $body.append(_$html('template'));

                mixin.push('template: ' + JSON.stringify('<div>' + $body.html() + '</div>'));

                if (_style) {
                  mixin.push('beforeCreate: function () {\n                  var style = document.createElement(\'style\');\n                  style.textContent = ' + JSON.stringify(_style) + ';\n                  document.head.appendChild(style);\n                  this.$styleInjectedByMarkdownToVueLoader = style;\n                }');
                  mixin.push('beforeDestroy: function () {\n                  var $style = this.$styleInjectedByMarkdownToVueLoader;\n                  $style.parentNode.removeChild($style);\n                }');
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
          mixin.push('name: ' + JSON.stringify(componentName));
          components.push(JSON.stringify(componentName) + ': ' + normalizeComponent(component, '{' + mixin.join() + '}'));

          var $component = $('<' + componentName + '></' + componentName + '>');

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

  $('table').each(function (i, table) {
    var $table = $(table);

    if (options.tableClass) {
      $table.addClass(options.tableClass);
    }

    if (options.tableWrapper) {
      $table.wrap(options.tableWrapper);
    }
  });

  var output = '<template>\n  <div>' + $('body').html() + '</div>\n</template>';

  if (options.exportSource || components.length > 0) {
    output += '<script>\n  module.exports = {\n    ' + (options.exportSource ? 'source: ' + JSON.stringify(markdown.utils.escapeHtml(source)) + ',' : '') + '\n    ' + (components.length > 0 ? 'components: {' + components.join() + '}' : '') + '\n  };\n</script>';
  }

  this.callback(null, output, map);
}

export default markdownToVueLoader;
