import svgCaptcha from "svg-captcha";

/**
 * Generates an SVG captcha with a mathematical expression.
 *
 * @param {Object} options - Options for generating the captcha.
 * @param {number} [options.width=150] - The width of the captcha image.
 * @param {number} [options.height=50] - The height of the captcha image.
 * @returns {Object} An object containing the captcha text and data.
 * @returns {string} returns.text - The text of the mathematical expression.
 * @returns {string} returns.data - The SVG data of the captcha image.
 */
export const generateSvgCaptcha = ({ width = 150, height = 50 }) => {
  const captcha = svgCaptcha.createMathExpr({
    mathMin: 1,
    mathMax: 9,
    mathOperator: "+-",
    background: "#ffffff",
    color: true,
    width,
    height,
  });

  return {
    text: captcha.text,
    data: captcha.data,
  };
};
