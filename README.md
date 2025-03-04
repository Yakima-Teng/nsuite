# nsuite

> Your missing nodejs development suite!

If you develop with Node.js, you will find that there are **many many many** functions/packages you need to write/install across **many** projects.
nsuite will make you feel more comfortable.
After install with `npm i -S nsuite`, you will have all the following abilities at your hand.

## Env

### parseEnvFiles

```js
import { parseEnvFiles } from 'nsuite/UtilsEnv.mjs'

// note: the first value set for a varialble will win
parseEnvFiles([
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env')
])
```

## Promise

### withTimeout

```js
import { withTimeout } from 'nsuite/UtilsPromise.mjs'
const newPromise = withTimeout(promise)
```

## Captcha

### generateSvgCaptcha

```js
import { generateSvgCaptcha } from 'nsuite/UtilsCaptcha.mjs'
const { text, data } = await generateSvgCaptcha({
    width: 148,
    height: 48,
})
```

## Text

### generateSummary

Generate a summary of given text.

```js
import { generateSummary } from 'nsuite/UtilsText.mjs'
const summary = generateSummary({
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    language: 'English',
    maxWords: 200,
    content: ''
})
```


## License

This project is published under MIT license, which means you can use it in business projects for free. However, it would be better if you give this repo a star!
