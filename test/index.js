const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const MemoryFS = require('memory-fs');
const { expect } = require('chai');

const mfs = new MemoryFS();

function bundle(options, callback, loaderOptions = {}) {
  const config = webpackMerge({
    output: {
      path: path.resolve(__dirname, './expected'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.md$/,
          use: [
            'vue-loader',
            {
              loader: path.resolve(__dirname, '../dist/index.js'),
              options: loaderOptions,
            },
          ],
        },
      ],
    },
  }, options);
  const webpackCompiler = webpack(config);

  webpackCompiler.outputFileSystem = mfs;
  webpackCompiler.run((err, stats) => {
    if (err) {
      console.error(err.stack || err);

      if (err.details) {
        console.error(err.details);
      }

      return;
    }

    if (stats.hasErrors()) {
      stats.compilation.errors.forEach((error) => {
        console.error(error.message);
      });
    }

    if (stats.hasWarnings()) {
      stats.compilation.warnings.forEach((warning) => {
        console.warn(warning.message);
      });
    }

    expect(err).to.be.null;
    expect(stats.compilation.errors).to.be.empty;
    callback(mfs.readFileSync(path.resolve(__dirname, './expected', config.output.filename)).toString());
  });
}

describe('markdown-to-vue-loader', () => {
  it('vue code block', (done) => {
    bundle({
      entry: './test/fixtures/vue.md',
    }, (content) => {
      expect(content).to.contain('component-vue-0');
      done();
    });
  });

  it('vue code block with template only', (done) => {
    bundle({
      entry: './test/fixtures/vue-with-template-only.md',
    }, (content) => {
      expect(content).to.contain('component-vue-with-template-only-0');
      done();
    });
  });

  it('vue code block with template and style', (done) => {
    bundle({
      entry: './test/fixtures/vue-with-template-and-style.md',
    }, (content) => {
      expect(content).to.contain('component-vue-with-template-and-style-0');
      done();
    });
  });

  it('vue code block with script only', (done) => {
    bundle({
      entry: './test/fixtures/vue-with-script-only.md',
    }, (content) => {
      expect(content).to.contain('component-vue-with-script-only-0');
      done();
    });
  });

  it('vue code block with script and style', (done) => {
    bundle({
      entry: './test/fixtures/vue-with-script-and-style.md',
    }, (content) => {
      expect(content).to.contain('component-vue-with-script-and-style-0');
      done();
    });
  });

  it('html code block', (done) => {
    bundle({
      entry: './test/fixtures/html.md',
    }, (content) => {
      expect(content).to.contain('component-html-0');
      done();
    });
  });

  it('multiple blocks', (done) => {
    bundle({
      entry: './test/fixtures/multiple.md',
    }, (content) => {
      expect(content).to.contain('component-multiple-0');
      expect(content).to.contain('component-multiple-1');
      done();
    });
  });

  it('comments', (done) => {
    bundle({
      entry: './test/fixtures/comments.md',
    }, (content) => {
      expect(content).to.contain('component-comments-0');
      expect(content).not.to.contain('component-comments-1');
      expect(content).not.to.contain('component-comments-2');
      expect(content).to.contain('component-comments-3');
      done();
    });
  });

  it('(name-contains-not-word-characters)', (done) => {
    bundle({
      entry: './test/fixtures/(name-contains-not-word-characters).md',
    }, (content) => {
      expect(content).to.contain('component-name-contains-not-word-characters-0');
      done();
    });
  });

  describe('options', () => {
    it('componentNamespace', (done) => {
      bundle({
        entry: './test/fixtures/vue.md',
      }, (content) => {
        expect(content).to.contain('test-component-namespace-vue-0');
        done();
      }, {
        componentNamespace: 'test-component-namespace',
      });
    });

    it('componentWrapper', (done) => {
      bundle({
        entry: './test/fixtures/vue.md',
      }, (content) => {
        expect(content).to.contain('test-component-wrapper');
        done();
      }, {
        componentWrapper: '<div class="test-component-wrapper"></div>',
      });
    });

    it('escapeApostrophes', (done) => {
      bundle({
        entry: './test/fixtures/vue.md',
      }, (content) => {
        expect(content).to.contain('&apos;');
        done();
      }, {
        escapeApostrophes: true,
      });
    });

    it('exportSource', (done) => {
      bundle({
        entry: './test/fixtures/vue.md',
      }, (content) => {
        expect(content).to.contain('# Vue code block');
        done();
      }, {
        exportSource: true,
      });
    });

    it('languages', (done) => {
      bundle({
        entry: './test/fixtures/js.md',
      }, (content) => {
        expect(content).to.contain('component-js-0');
        done();
      }, {
        languages: ['js', 'javascript'],
      });
    });

    it('preClass', (done) => {
      bundle({
        entry: './test/fixtures/vue.md',
      }, (content) => {
        expect(content).to.contain('test-pre-class');
        done();
      }, {
        preClass: 'test-pre-class',
      });
    });

    it('preWrapper', (done) => {
      bundle({
        entry: './test/fixtures/vue.md',
      }, (content) => {
        expect(content).to.contain('test-pre-wrapper');
        done();
      }, {
        preWrapper: '<div class="test-pre-wrapper"></div>',
      });
    });

    it('tableClass', (done) => {
      bundle({
        entry: './test/fixtures/table.md',
      }, (content) => {
        expect(content).to.contain('test-table-class');
        done();
      }, {
        tableClass: 'test-table-class',
      });
    });

    it('tableWrapper', (done) => {
      bundle({
        entry: './test/fixtures/table.md',
      }, (content) => {
        expect(content).to.contain('test-table-wrapper');
        done();
      }, {
        tableWrapper: '<div class="test-table-wrapper"></div>',
      });
    });
  });
});
