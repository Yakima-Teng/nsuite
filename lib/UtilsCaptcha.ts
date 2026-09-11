import svgCaptcha from "svg-captcha";

/**
 * Utility functions for captcha generation.
 */

export type GenerateSvgCaptchaOptions = NonNullable<
  Parameters<typeof svgCaptcha.createMathExpr>[0]
>;

export interface ReturnGenerateSvgCaptcha {
  text: string;
  data: string;
}

/**
 * Generates an SVG captcha with a mathematical expression.
 *
 * @param options - Options for generating the captcha. All fields are optional
 *   and fall back to svg-captcha defaults, except where noted. Supports all
 *   svg-captcha `createMathExpr` options.
 * @param [options.width=150] - The width of the captcha image.
 * @param [options.height=50] - The height of the captcha image.
 * @param [options.size] - The length of the random string (default: 4).
 * @param [options.fontSize] - The captcha text size.
 * @param [options.charPreset] - The random character preset.
 * @param [options.color=true] - Whether to randomly colorize the captcha.
 * @param [options.inverse] - Draw with light grey color for dark themes.
 * @param [options.ignoreChars] - Characters filtered out from the captcha.
 * @param [options.noise=1] - The number of noise lines.
 * @param [options.background="#ffffff"] - The background color of the svg.
 * @param [options.mathOperator="+-"] - The math operator: "+", "-" or "+-" .
 * @param [options.mathMin=1] - The min value of the math expression.
 * @param [options.mathMax=9] - The max value of the math expression.
 * @returns An object containing the captcha text and data.
 *
 * @example
 * import { generateSvgCaptcha } from "nsuite";
 * const { text, data } = await generateSvgCaptcha({
 *   width: 148,
 *   height: 48,
 *   size: 5,
 *   fontSize: 42,
 *   charPreset: "abc",
 *   color: true,
 *   inverse: false,
 *   ignoreChars: "0o1il",
 *   noise: 2,
 *   background: "#ffffff",
 *   mathOperator: "+-",
 *   mathMin: 1,
 *   mathMax: 9,
 * });
 */
export function generateSvgCaptcha(
  options: GenerateSvgCaptchaOptions = {},
): ReturnGenerateSvgCaptcha {
  const { width = 150, height = 50 } = options;
  const captcha = svgCaptcha.createMathExpr({
    mathMin: 1,
    mathMax: 9,
    mathOperator: "+-",
    background: "#ffffff",
    color: true,
    ...options,
    width,
    height,
  });

  return {
    text: captcha.text,
    data: captcha.data,
  };
}
