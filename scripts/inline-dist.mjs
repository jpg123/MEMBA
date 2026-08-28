import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const dist = resolve('dist')
let html = await readFile(resolve(dist, 'index.html'), 'utf8')

const assetPattern = /<script[^>]+src="\/assets\/([^"]+)"[^>]*><\/script>|<link[^>]+href="\/assets\/([^"]+)"[^>]*>/g
const assets = [...html.matchAll(assetPattern)]

for (const match of assets) {
  const filename = match[1] ?? match[2]
  const asset = await readFile(resolve(dist, 'assets', filename), 'utf8')
  if (filename.endsWith('.css')) {
    html = html.replace(match[0], () => `<style>${asset}</style>`)
  } else if (filename.endsWith('.js')) {
    html = html.replace(match[0], () => `<script type="module">${asset}</script>`)
  }
}

await writeFile(resolve(dist, 'index.html'), html)
