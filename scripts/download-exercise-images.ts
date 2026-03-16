import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'exercise-catalog.json'), 'utf-8')
) as Array<{ name: string; images: string[] }>

const outDir = path.join(__dirname, '..', 'public', 'exercises')

function toFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '')
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          file.close()
          fs.unlinkSync(dest)
          downloadFile(redirectUrl, dest).then(resolve, reject)
          return
        }
      }
      response.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', (err) => {
      fs.unlinkSync(dest)
      reject(err)
    })
  })
}

async function main() {
  let downloaded = 0
  let skipped = 0

  for (const exercise of catalog) {
    const folder = toFolderName(exercise.name)
    const dir = path.join(outDir, folder)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    for (let i = 0; i < exercise.images.length; i++) {
      const dest = path.join(dir, `${i}.jpg`)
      if (fs.existsSync(dest)) {
        skipped++
        continue
      }
      try {
        await downloadFile(exercise.images[i], dest)
        downloaded++
        process.stdout.write(`\r  Downloaded: ${downloaded} | Skipped: ${skipped}`)
      } catch (err) {
        console.error(`\n  Failed: ${exercise.name} image ${i}:`, err)
      }
    }
  }

  console.log(`\n  Done! ${downloaded} downloaded, ${skipped} skipped`)
}

main()
