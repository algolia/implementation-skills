// BASE_PATH lets CI build for a subpath deploy (GitHub Pages under
// community.algolia.com/implementation-skills/); defaults to root.
export default {
  base: process.env.BASE_PATH || '/',
  plugins: [{
    name: 'benchmark-directory-index',
    configureServer(server) {
      // Public HTML has a directory index on Pages; make its canonical URL
      // behave the same way in development instead of serving the React app.
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const base = process.env.BASE_PATH || '/';
        if (url.pathname === `${base}benchmark/`) {
          req.url = `${base}benchmark/index.html${url.search}`;
        }
        next();
      });
    },
  }],
};
