import { Request, Response } from 'express';

export const chatWithAI = async (req: Request, res: Response): Promise<any> => {
    const { message } = req.body;

    // Read API key inside the request to ensure it is loaded after dotenv.config()
    const currentApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!currentApiKey) {
        console.warn('⚠️ GEMINI_API_KEY is not defined. Returning mock response.');
        return res.json({
            response: `[CHẾ ĐỘ MÔ PHỎNG] Chào bạn! Tôi là Greenie. Hiện tại hệ thống AI đang được bảo trì, bạn có thể hỏi tôi về mận Mỹ Tho nhé! Bạn vừa nói: "${message}"`
        });
    }

    try {
        console.log('🤖 Sending request to Gemini AI (gemini-3-flash-preview)...');
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${currentApiKey}`,
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
                        maxOutputTokens: 250,
                        temperature: 0.7,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData: any = await response.json();
            console.error('❌ Gemini API Error:', JSON.stringify(errorData));

            // Xử lý lỗi hết hạn mức (Quota) một cách thân thiện
            if (response.status === 429) {
                return res.json({
                    response: 'Chào bạn! Greenie hiện đang tiếp đón rất nhiều khách tham quan nên hơi bận một chút. Bạn hãy thử lại sau ít phút hoặc hotline 0123.456.789 nhé! 🌿'
                });
            }

            throw new Error(errorData.error?.message || 'Gemini API Error');
        }

        const data: any = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tôi nhận được thông tin rồi, nhưng chưa kịp xử lý. Bạn hỏi lại câu khác nhé! 🌿';

        console.log('✅ AI Response received');
        return res.json({ response: aiResponse });
    } catch (error: any) {
        console.error('🔥 AI Service Error:', error.message);
        return res.status(200).json({
            response: 'Xin lỗi, tôi đang bận một chút. Bạn thử lại sau nhé! 🌿',
            error: error.message
        });
    }
};
