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