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
export function generateSvgCaptcha({ width, height }: {
    width?: number | undefined;
    height?: number | undefined;
}): ReturnGenerateSvgCaptcha;
export type ReturnGenerateSvgCaptcha = {
    /**
     * - The text of the mathematical expression.
     */
    text: string;
    /**
     * - The SVG data of the captcha image.
     */
    data: string;
};
//# sourceMappingURL=UtilsCaptcha.d.mts.map