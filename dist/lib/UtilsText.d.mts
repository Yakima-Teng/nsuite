/**
 * Generates a summary of the provided content using OpenAI's chat completions API.
 *
 * @param {Object} options - The options for generating the summary.
 * @param {string} options.apiKey - The API key for OpenAI.
 * @param {string} options.baseUrl - The base URL for the OpenAI API.
 * @param {string} options.model - The model to use for generating the summary.
 * @param {string} options.language - The language in which the summary should be written.
 * @param {number} options.maxWords - The maximum number of words the summary should contain.
 * @param {string} options.content - The content to be summarized.
 * @returns {Promise<string>} - A promise that resolves to the generated summary.
 * @throws {Error} - Throws an error if there is a problem generating the summary.
 *
 * @example
 * import { generateSummary } from "nsuite";
 * const summary = generateSummary({
 *   apiKey: "",
 *   baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
 *   model: "qwen-turbo",
 *   language: "English",
 *   maxWords: 200,
 *   content: "",
 * });
 */
export function generateSummary({ apiKey, baseUrl, model, language, maxWords, content, }: {
    apiKey: string;
    baseUrl: string;
    model: string;
    language: string;
    maxWords: number;
    content: string;
}): Promise<string>;
//# sourceMappingURL=UtilsText.d.mts.map