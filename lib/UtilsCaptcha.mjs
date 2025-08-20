import svgCaptcha from "svg-captcha";

/**
 * @typedef {Object} ReturnGenerateSvgCaptcha
 * @property {string} text - The text of the mathematical expression.
 * @property {string} data - The SVG data of the captcha image.
 */

/**
 * Generates an SVG captcha with a mathematical expression.
 *
 * @param {Object} options - Options for generating the captcha.
 * @param {number} [options.width=150] - The width of the captcha image.
 * @param {number} [options.height=50] - The height of the captcha image.
 * @returns {ReturnGenerateSvgCaptcha} An object containing the captcha text and data.
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
