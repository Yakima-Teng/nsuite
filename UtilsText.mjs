import OpenAI from "openai";

export const generateSummary = async ({ apiKey, baseUrl, language, maxWords, content }) => {
  try {
    const openai = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            `You are a professional writer, you can write a summary of the article. The summary should be in ${language} and should be less than ${maxWords} words (each English letter, number, and symbol is considered as one word).`,
        },
        { role: "user", content },
      ],
      model: "qwen-turbo",
      /**
       * 采样温度，控制模型生成文本的多样性。
       * temperature越高，生成的文本更多样，反之，生成的文本更确定。
       * 取值范围： [0, 2)
       */
      temperature: 0.7,
      max_tokens: 200,
      /**
       * 控制模型生成文本时的内容重复度。
       * 取值范围：[-2.0, 2.0]。正数会减少重复度，负数会增加重复度。
       * 适用场景：
       * 较高的presence_penalty适用于要求多样性、趣味性或创造性的场景，如创意写作或头脑风暴。
       * 较低的presence_penalty适用于要求一致性或专业术语的场景，如技术文档或其他正式文档。
       */
      presence_penalty: -2.0,
    });
    console.log(JSON.stringify(completion));
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};
