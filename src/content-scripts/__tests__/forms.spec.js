import puppeteer from 'puppeteer'
import _ from 'lodash'
import {launchPuppeteerWithExtension, runDist} from '../../__e2e-tests__/helpers'
import { waitForAndGetEvents, cleanEventLog, startServer } from './helpers'

let server
let browser
let page

describe('forms', () => {
  const tab = 1
  const change = 1
  test('it should load the form', async () => {
    const form = await page.$('form')
    expect(form).toBeTruthy()
  })

  test('it should record text input elements', async () => {
    const string = 'I like turtles'
    await page.type('input[type="text"]', string)
    await page.keyboard.press('Tab')

    const eventLog = await waitForAndGetEvents(page, string.length + tab + change)
    const event = _.find(eventLog, e => { return e.action === 'keydown' && e.keyCode === 9 })
    expect(event.value).toEqual(string)
  })

  test('it should record textarea elements', async () => {
    const string = 'I like turtles\n but also cats'
    await page.type('textarea', string)
    await page.keyboard.press('Tab')

    const eventLog = await waitForAndGetEvents(page, string.length + tab + change)
    const event = _.find(eventLog, e => { return e.action === 'keydown' && e.keyCode === 9 })
    expect(event.value).toEqual(string)
  })

  test('it should record radio input elements', async () => {
    await page.click('#radioChoice1')
    await page.click('#radioChoice3')
    const eventLog = await waitForAndGetEvents(page, 2 + (2 * change))
    expect(eventLog[0].value).toEqual('radioChoice1')
    expect(eventLog[2].value).toEqual('radioChoice3')
  })

  test('it should record select and option elements', async () => {
    await page.select('select', 'hamster')
    const eventLog = await waitForAndGetEvents(page, 1)
    expect(eventLog[0].value).toEqual('hamster')
    expect(eventLog[0].tagName).toEqual('SELECT')
  })

  test('it should record checkbox input elements', async () => {
    await page.click('#checkbox1')
    await page.click('#checkbox2')
    const eventLog = await waitForAndGetEvents(page, 2 + (2 * change))
    expect(eventLog[0].value).toEqual('checkbox1')
    expect(eventLog[2].value).toEqual('checkbox2')
  })
})

beforeAll(async (done) => {
  await runDist()
  const buildDir = process.env.NODE_ENV === 'production' ? '../../../dist' : '../../../build'
  const fixture = './fixtures/forms.html'
  server = await startServer(buildDir, fixture)
  return done()
}, 20000)

afterAll(done => {
  server.close(() => {
    return done()
  })
})

beforeEach(async () => {
  browser = await launchPuppeteerWithExtension(puppeteer)
  page = await browser.newPage()
  await page.goto('http://localhost:3000/')
  await cleanEventLog(page)
})

afterEach(async () => {
  browser.close()
})
