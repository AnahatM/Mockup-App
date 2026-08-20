import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'shell',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1600,1000'],
})
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1600, height: 1000 })
  await page.goto('http://localhost:4173/studio', { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 3000))

  async function selectTab(name) {
    const tabs = await page.$$('[role="tab"]')
    const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
    const tab = tabs[labels.findIndex((l) => l?.trim() === name)]
    await tab.click()
    await new Promise((r) => setTimeout(r, 300))
  }
  async function panelHandleExact(title) {
    const handle = await page.evaluateHandle((t) => {
      const sections = [...document.querySelectorAll('section')]
      return sections.find((s) => s.querySelector('header')?.textContent?.trim() === t) ?? null
    }, title)
    return handle.asElement()
  }
  async function setSlider(section, label, value) {
    const found = await section.evaluate((el, l, v) => {
      const input = el.querySelector(`input[type="range"][aria-label="${l}"]`)
      if (!input) return false
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      setter.call(input, String(v))
      input.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    }, label, value)
    await new Promise((r) => setTimeout(r, 400))
    return found
  }
  async function readValue(section, label) {
    return section.evaluate((el, l) => {
      const input = el.querySelector(`input[type="range"][aria-label="${l}"]`)
      return input ? input.value : 'NOT FOUND'
    }, label)
  }

  await selectTab('Scene')
  const pedestalBase = await panelHandleExact('Pedestal')
  console.log('pedestalBase found:', Boolean(pedestalBase))
  console.log('before:', await readValue(pedestalBase, 'Roughness'))
  const found = await setSlider(pedestalBase, 'Roughness', 0.3)
  console.log('setSlider found input:', found)
  console.log('after:', await readValue(pedestalBase, 'Roughness'))
} finally {
  await browser.close()
}
