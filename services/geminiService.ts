
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AuraState, AuraSuggestion, AuraSyncSuggestion, Message, VoiceOption, LearningLevel } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Base64 encoded Westline Logo SVG (Cleaned string)
const LOGO_SVG_BASE64 = 'PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI0U0OUUxMCIvPjxwYXRoIGQ9Ik0yMiA2OCBMMzggMzIgTDQ2IDU0IEw1NCAzMiBMNzAgNjggSDYwIEw1NCA1MiBMNDggNjggSDM4IEw0NiA0OCBMNDAgNjggSDIyIFoiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTTc1IDI2IEw3OC41IDI5LjUgTDgyIDMyIEw3OC41IDM0LjUgTDc1IDM4IEw3MS41IDM0LjUgTDY4IDMyIEw3MS41IDI5LjUgWiIgZmlsbD0iIzRmNDZlNSIvPjwvc3ZnPg==';

const LOGO_TOKEN = "[[WESTLINE_LOGO]]";

// Audio Context Singleton to reduce latency
let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
}

// Helper for PCM decoding
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


export const geminiService = {
    LOGO_TOKEN,

    getLogoDataUrl: () => `data:image/svg+xml;base64,${LOGO_SVG_BASE64}`,

    streamResponse: async function* (
        prompt: string,
        history: { role: 'user' | 'model'; parts: { text: string }[] }[],
        aura: AuraState,
        isPremium: boolean,
        learningLevel: LearningLevel
    ) {
        let systemInstruction = "You are WestlineGPT, a helpful creative assistant developed by Westline Techlabs.\n\n" +
            "**FORMATTING GUIDELINES:**\n" +
            "1. **Casual Chat:** For greetings, simple questions, or short conversational turns, use PLAIN TEXT. Do NOT use bullet points, headers, or excessive bold text. Keep it natural.\n" +
            "2. **Learning & Detailed Content:** When explaining concepts, providing tutorials, listing steps, or giving long answers, you MUST use MARKDOWN. Use bullet points for lists, bolding for key terms, and headers to organize the information clearly.\n\n";
        
        // Add Learning Level Context
        switch (learningLevel) {
            case 'Absolute Beginner':
                systemInstruction += "**LEARNING MODE: ABSOLUTE BEGINNER**\n" +
                    "- Assume the user has zero prior knowledge.\n" +
                    "- Use simple, non-technical language.\n" +
                    "- Explain step-by-step with analogies.\n" +
                    "- Tone: Encouraging, patient, and welcoming.\n";
                break;
            case 'Beginner Builder':
                systemInstruction += "**LEARNING MODE: BEGINNER BUILDER**\n" +
                    "- The user knows basics but needs practice.\n" +
                    "- Focus on 'how-to' for simple tools and tasks.\n" +
                    "- Keep explanations clear but start introducing proper terminology.\n" +
                    "- Tone: Supportive and action-oriented.\n";
                break;
            case 'Creator':
                systemInstruction += "**LEARNING MODE: CREATOR**\n" +
                    "- The user is building real projects.\n" +
                    "- Focus on creative identity, combining tools, and project workflows.\n" +
                    "- Offer suggestions for new tools to try.\n" +
                    "- Tone: Inspiring and collaborative.\n";
                break;
            case 'Pro Practitioner':
                systemInstruction += "**LEARNING MODE: PRO PRACTITIONER**\n" +
                    "- The user is advanced and skilled.\n" +
                    "- Focus on efficiency, professional workflows, and high-level polish.\n" +
                    "- Be concise, technical, and precise.\n" +
                    "- Tone: Professional and efficient.\n";
                break;
            case 'Mentor & Launch':
                systemInstruction += "**LEARNING MODE: MENTOR & LAUNCH**\n" +
                    "- The user is an expert or leader.\n" +
                    "- Focus on business strategy, portfolio building, and teaching others.\n" +
                    "- Discuss industry trends and leadership.\n" +
                    "- Tone: Peer-to-peer, strategic, and sophisticated.\n";
                break;
        }

        systemInstruction += "\n**AURA PERSONALITY:**\n";
        
        switch (aura) {
            case 'Rain': systemInstruction += "Your personality is calm, reflective, and slightly poetic, like a rainy day."; break;
            case 'Fire': systemInstruction += "Your personality is bold, energetic, and concise. You get straight to the point with enthusiasm."; break;
            case 'Ice Drip': systemInstruction += "Your personality is cool, sophisticated, and precise. You focus on elegance and clarity."; break;
            case 'Lava': systemInstruction += "Your personality is intense and flowing. You are passionate about creativity."; break;
            case 'Steam': systemInstruction += "Your personality is mysterious and ephemeral. You give hints and encourage exploration."; break;
            default: systemInstruction += "Be friendly, professional, and helpful."; break;
        }

        if (prompt.toLowerCase().includes("logo")) {
            systemInstruction += ` If the user asks for the Westline logo, include the token ${LOGO_TOKEN} in your response.`;
        }

        const modelName = isPremium ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';

        const contents = [
            ...history.map(h => ({
                role: h.role,
                parts: h.parts.map(p => ({ text: p.text }))
            })),
            { role: 'user', parts: [{ text: prompt }] }
        ];

        try {
            const response = await ai.models.generateContentStream({
                model: modelName,
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            for await (const chunk of response) {
                if (chunk.text) {
                    yield chunk.text;
                }
            }
        } catch (error) {
            console.error("Gemini API Error:", error);
            yield "I'm having trouble connecting to my creative core right now. Please try again.";
        }
    },

    analyzeForAuraSuggestion: (prompt: string, currentAura: AuraState): AuraSuggestion | null => {
        const lower = prompt.toLowerCase();
        
        if ((lower.includes('sad') || lower.includes('cry') || lower.includes('rain') || lower.includes('blue')) && currentAura !== 'Rain') {
            return { aura: 'Rain', reason: 'I sense a somber mood.', isPremium: false };
        }
        if ((lower.includes('excited') || lower.includes('fire') || lower.includes('bold') || lower.includes('fast')) && currentAura !== 'Fire') {
            return { aura: 'Fire', reason: 'Matching your high energy!', isPremium: true };
        }
        if ((lower.includes('cool') || lower.includes('ice') || lower.includes('freeze')) && currentAura !== 'Ice Drip') {
            return { aura: 'Ice Drip', reason: 'Staying cool.', isPremium: false };
        }
        
        return null;
    },

    getAuraSyncSuggestion: async (prompt: string, currentAura: AuraState): Promise<AuraSyncSuggestion | null> => {
        if (currentAura === 'Fire' && prompt.length > 5 && prompt.length < 30) {
            return {
                original: prompt,
                enhanced: `🔥 ${prompt.toUpperCase()}!!! Tell me more about it with PASSION!`
            };
        }
        return null;
    },

    generateChatTitle: async (messageText: string): Promise<string> => {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a very short, specific title (max 4 words) for a chat starting with: "${messageText}". Do NOT use quotation marks.`,
            });
            return response.text?.trim().replace(/^["']|["']$/g, '') || "New Chat";
        } catch (error) {
            return "New Chat";
        }
    },

    generateDynamicPrompts: async (messages: Message[]): Promise<string[]> => {
        if (messages.length === 0) return [];
        
        const context = messages
            .filter(m => m.sender === 'user')
            .slice(-3)
            .map(m => m.text)
            .join('\n');

        if (!context) return [];

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on the following conversation context, generate 4 short, relevant follow-up questions or creative prompts for the user.\n\nContext:\n${context}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            });
            
            if (response.text) {
                return JSON.parse(response.text);
            }
            return [];
        } catch (error) {
            console.error("Error generating dynamic prompts:", error);
            return [];
        }
    },

    editImage: async (prompt: string, imageBase64: string, mimeType: string): Promise<{ data: string; mimeType: string } | null> => {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { 
                            inlineData: { 
                                data: base64Data, 
                                mimeType: mimeType 
                            } 
                        },
                        { text: prompt }
                    ]
                }
            });

            const parts = response.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData) {
                        return {
                            data: part.inlineData.data,
                            mimeType: part.inlineData.mimeType
                        };
                    }
                }
            }
            return null;
        } catch (error) {
            console.error("Image edit error:", error);
            return null;
        }
    },

    generateImage: async (prompt: string, aspectRatio: string = "1:1"): Promise<{ data: string; mimeType: string } | null> => {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { text: prompt }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio
                    }
                }
            });

            const parts = response.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData) {
                         return {
                            data: part.inlineData.data,
                            mimeType: part.inlineData.mimeType
                        };
                    }
                }
            }
            return null;
        } catch (error) {
            console.error("Image generation error:", error);
            return null;
        }
    },

    stopAudio: () => {
        if (currentSource) {
            try {
                currentSource.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            currentSource = null;
        }
    },

    generateSpeech: async (text: string, voice: VoiceOption, cachedBuffer?: AudioBuffer, onEnded?: () => void): Promise<AudioBuffer | null> => {
        // Always stop current audio first to avoid overlap
        geminiService.stopAudio();

        const ctx = getAudioContext();
        let audioBuffer: AudioBuffer | null = null;

        try {
            if (cachedBuffer) {
                audioBuffer = cachedBuffer;
            } else {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-preview-tts',
                    contents: [{ parts: [{ text: text }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: { voiceName: voice }
                            },
                        },
                    },
                });

                const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (!base64Audio) return null;

                audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ctx,
                    24000,
                    1
                );
            }

            if (audioBuffer) {
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => {
                    currentSource = null;
                    if (onEnded) onEnded();
                };
                source.start();
                currentSource = source;
                return audioBuffer;
            }

        } catch (error) {
            console.error("TTS Error:", error);
        }
        return null;
    }
};
