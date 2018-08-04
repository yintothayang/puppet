import puppeteer from 'puppeteer'
import {extract, cleanup} from 'aws-puppeteer-lambda'

export const handler = async(event, context) => {

  const executablePath = await extract()

  // Initialize a new browser instance with puppeteer to execute within Lambda.
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    args: [
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
      '--no-sandbox'
    ],
    executablePath
  })

  // Run puppeteer script
  const page = await browser.newPage()
  await page.goto('https://example.com')
  let bodyHTML = await page.evaluate(() => document.body.innerHTML);
  await browser.close()

  // Cleanup the TMP folder after each execution otherwise Chromium's
  // garbage will cause the Lambda container to run out of space.
  await cleanup()


  let statusCode = 200
  let headers = {}
  let body = {message: "puppet", html: bodyHTML}

  var response = {
    statusCode: statusCode,
    headers: {},
    body: JSON.stringify(body)
  }

  return response
}
