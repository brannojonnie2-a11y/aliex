import { Plugin } from 'vite';

export function noHostCheck(): Plugin {
  return {
    name: 'no-host-check',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Allow all hosts
        next();
      });
    },
  };
}
