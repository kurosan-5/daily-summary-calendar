import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIEvaluationSchema, type AIEvaluation } from '../types/schemas';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateAIEvaluation(
  rawText: string,
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean }
): Promise<AIEvaluation> {
  const prompt = `あなたは日本語の日記を読み、JSON形式で評価を返すアシスタントです。
ポジティブさ、活動の多様性、自己ケア（食事のチェックボックスが提供されます）、反省を考慮してください。
簡潔な日本語の要約を返してください。
文章の中に場所の名前などが含まれている場合はそれをPlaceに抽出してください。
どれくらい外出しているか、というのもレベル評価してください。どれくらい長い時間外出していたか、アバウトでいいので評価して、外出時間が長いOr遠そうなら数値を高くしてください。
スコアは、1から10の整数で、1が最低、10が最高です。これまでの、外出度や、活動内容から総合的に評価してください
楽しさや食事など、不明なことが多ければスコアは低くしてください。しかし、やったことの質が低くてもスコアは低くしてください。
例えば、「今日は楽しかった。」「今日は満足した」「犬の散歩」という場合、一日を楽しんでいるようですが、具体性がないため、評価は低く、スコアは２以下にしてください。
逆に、長い文章であったり、「今日は特許を取った。」などの快挙を成し遂げたと判断した場合は評価をとても高く、スコアは８以上にしてください。
さらに、やったことが、創作的であったり、運動をよくしていたり、自分の満足感が高そうであればスコアは高くしてください。
そして、全体的に、正規分布に従うように評価をしてください。つまり、なるべく真ん中あたりの５を中心にして、よければ６，もっと良ければ７、などとしてください。評価は厳しめでお願いします。無難な感想であれば、スコアは４にしてください。

そして、最後に、あなたが算出したスコアや外出レベルを参照し、そこから想定される行動や感情を考えてみてください。そのあとに今回の行動や感想を見て、本当にそのスコアが無難なのかを推敲してください。

INPUT:
- journal_text: ${rawText}
- meals: ${JSON.stringify(meals)}

評価には、ある程度食事も反映させてください。

OUTPUT JSON SCHEMA:
{
  "summary": "0-150字の要約。あなたの感想はいりません。要約のみ行ってください。短くてもかまいません。150字以内であれば長くなってもかまいません。情報が不明な場合でも、具体的な行動や感情は不明ですとは記述せず、あくまでも要約に徹してください。○○という記述がありますというのもやめて、その場合はそのまま出力してください。",
  "score": 1-10,
  "tags": ["最大5つのキーワード。文章量が少なければ1つや２つでもいいです"],
  "places": ["地名/施設名（なければ[]）"],
  "went_out_level": 0|1|2|3
}

Constraints:
- Score integer 1..10 only.
- Be neutral; avoid moral judgement.
- If text is empty, score=5, summary="未入力"、他は空。

Please respond with valid JSON only.`;

  try {


    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No response from Gemini');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    const parsed = JSON.parse(jsonString);
    return AIEvaluationSchema.parse(parsed);
  } catch (error) {
    console.error('Error generating AI evaluation:', error);
    
    // Fallback response
    return {
      summary: rawText ? "分析中にエラーが発生しました" : "未入力",
      score: 5,
      tags: [],
      places: [],
      went_out_level: 0
    };
  }
}