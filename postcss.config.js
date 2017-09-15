module.exports = {
  plugins: [
    require('postcss-smart-import')(),
    require('postcss-atrule-bem')(),
    require('postcss-cssnext')(),
  ],
};
