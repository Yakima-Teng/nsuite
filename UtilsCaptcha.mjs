import svgCaptcha from 'svg-captcha'

export const generateSvgCaptcha = ({ width = 150, height = 50 }) => {
    console.log(svgCaptcha)
    const captcha = svgCaptcha.createMathExpr({
        mathMin: 1,
        mathMax: 9,
        mathOperator: '+-',
        background: '#ffffff',
        color: true,
        width,
        height,
    })

    return {
        text: captcha.text,
        data: captcha.data,
    }
}
