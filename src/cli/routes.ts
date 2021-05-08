import { join, toFileUrl, walk } from "./deps.ts";

export async function routesSubcommand() {
  const files = [];
  const pagesDir = join(Deno.cwd(), "./pages");
  const pagesUrl = new URL(pagesDir, "file:///");
  const folder = walk(pagesDir, {
    includeDirs: false,
    includeFiles: true,
    exts: ["tsx", "jsx"],
  });
  for await (const entry of folder) {
    if (entry.isFile) {
      const file = toFileUrl(entry.path).href.substring(pagesUrl.href.length);
      files.push(file);
    }
  }

  const output = `// DO NOT EDIT. This file is generated by \`fresh\`.
// This file SHOULD be checked into source version control.
// To update this file, run \`fresh routes\`.
  
import { setup } from "${new URL("../../server.ts", import.meta.url)}";

${files.map((file, i) => `import * as $${i} from "./pages${file}";`).join("\n")}

setup([${
    files.map((file, i) => `[$${i}, "./pages${file}"]`)
      .join(", ")
  }], import.meta.url);
`;

  await Deno.writeTextFile("./server.ts", output);
}
