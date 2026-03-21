const { existsSync, rmSync } = require('fs');
const { join } = require('path');

module.exports = {
  onPostBuild: () => {
    const dir = join(process.cwd(), '.netlify', 'functions');
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  },
};
