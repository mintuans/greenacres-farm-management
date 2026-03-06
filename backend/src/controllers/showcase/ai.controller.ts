import { Request, Response } from 'express';

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export const chatWithAI = async (req: Request, res: Response): Promise<any> => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!API_KEY) {
        console.warn('GEMINI_API_KEY is not defined. Returning mock AI response.');
        return res.json({
            response: `[MÔ PHỎNG AI] Bạn đã nói: "${message}". Để sử dụng AI thật, vui lòng cấu hình GEMINI_API_KEY trong tệp .env.`
        });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `Bạn là Greenie 🌿, trợ lý thông minh của trang web "Vườn Nhà Mình" - một nông trại mận hữu cơ tại Mỹ Tho, Tiền Giang. 
                                    Hãy trả lời khách hàng một cách thân thiện, nhiệt tình và am hiểu về nông nghiệp sạch. 
                                    Nếu khách hỏi về mận, hãy giới thiệu mận Mỹ Tho rất ngọt và sạch.
                                    Thông tin vườn: Mỹ Tho, Tiền Giang. Hotline: 0123.456.789.
                                    Yêu cầu: Trả lời ngắn gọn, súc tích (dưới 100 từ).
                                    Câu hỏi của khách: ${message}`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 200,
                        temperature: 0.7,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData: any = await response.json();
            throw new Error(errorData.error?.message || 'Gemini API Error');
        }

        const data: any = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tôi xin lỗi, tôi gặp chút trục trặc khi suy nghĩ. Bạn có thể hỏi lại không?';

        return res.json({ response: aiResponse });
    } catch (error: any) {
        console.error('AI Service Error:', error.message);
        return res.status(500).json({ error: 'Failed to connect to AI service', details: error.message });
    }
};
