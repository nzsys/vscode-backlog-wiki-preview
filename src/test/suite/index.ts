import * as path from 'path'
import { fileURLToPath } from 'url'
import Mocha from 'mocha'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function run(): Promise<void> {
	const mocha = new Mocha({
		ui: 'bdd',
		color: true
	})

	// @ts-ignore
	mocha.suite.emit('pre-require', globalThis, '', mocha)

	const testsRoot = path.resolve(__dirname, '..')

	return new Promise((c, e) => {
		glob('suite/*.test.js', { cwd: testsRoot }).then(async files => {
			for (const f of files) {
				await import(path.resolve(testsRoot, f))
			}

			try {
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`))
					} else {
						c()
					}
				})
			} catch (err) {
				console.error(err)
				e(err)
			}
		})
	})
}
