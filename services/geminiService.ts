
import { GoogleGenAI, Type } from "@google/genai";
import { SongMetadata } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async processMusicVideo(videoBase64: string, mimeType: string): Promise<SongMetadata> {
    const prompt = `
      Bạn là chuyên gia Karaoke. Nhiệm vụ: Tạo phụ đề học ngoại ngữ 3 dòng chuẩn xác.

      QUY TẮC XỬ LÝ NGÔN NGỮ (BẮT BUỘC):
      1. Nếu bài hát là TIẾNG VIỆT:
         - "phonetic_vietnamese": ĐỂ TRỐNG ("").
         - "vietnamese_translation": Dịch sang TIẾNG ANH (English) để người nghe hiểu nghĩa.
         - "original_lyrics": Lời bài hát tiếng Việt.
      
      2. Nếu bài hát là TIẾNG TRUNG/NHẬT/HÀN (Tượng hình):
         - "phonetic_vietnamese": Phiên âm Latin (Pinyin, Romaji...) kèm dấu thanh điệu nếu có (để người dùng biết cách đọc chính xác).
         - "vietnamese_translation": Dịch sang TIẾNG VIỆT.
         - "original_lyrics": Ký tự gốc (Hán tự/Kanji/Hangul).

      3. Nếu bài hát là TIẾNG ANH hoặc ngôn ngữ Latin khác:
         - "phonetic_vietnamese": Phiên âm cách đọc bồi sang tiếng Việt (Ví dụ: "Love" -> "Lớp", "Future" -> "Phiu-chơ").
         - "vietnamese_translation": Dịch sang TIẾNG VIỆT.

      YÊU CẦU ĐỒNG BỘ:
      - "word_level_timings": Cực kỳ chính xác, khớp từng từ một.

      Output JSON: title, artist, detected_language, subtitles.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: videoBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            detected_language: { type: Type.STRING },
            subtitles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  start_time: { type: Type.NUMBER },
                  end_time: { type: Type.NUMBER },
                  original_lyrics: { type: Type.STRING },
                  phonetic_vietnamese: { type: Type.STRING },
                  vietnamese_translation: { type: Type.STRING },
                  word_level_timings: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        word: { type: Type.STRING },
                        start_time: { type: Type.NUMBER },
                        end_time: { type: Type.NUMBER }
                      },
                      required: ["word", "start_time", "end_time"]
                    }
                  }
                },
                required: ["id", "start_time", "end_time", "original_lyrics", "phonetic_vietnamese", "vietnamese_translation", "word_level_timings"]
              }
            }
          },
          required: ["title", "artist", "detected_language", "subtitles"]
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("AI không phản hồi.");
    
    return JSON.parse(jsonStr) as SongMetadata;
  }
}

export const geminiService = new GeminiService();
