import axios, { AxiosInstance } from "axios";

// ✅ Piston API Configuration (For Code Execution)
const pistonBaseUrl = "https://emkc.org/api/v2/piston";
const pistonInstance: AxiosInstance = axios.create({
    baseURL: pistonBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

const API_BASE_URL = "http://localhost:3000/api/chatbot";

export const sendMessageToChatbot = async (message: string, onChunk: (chunk: string) => void): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim().startsWith("data:"));

            for (const line of lines) {
                const data = line.replace("data:", "").trim();
                if (data) {
                    const parsedData = JSON.parse(data);
                    onChunk(parsedData.content); // Pass each chunk to the callback
                }
            }
        }
    } catch (error) {
        console.error("❌ API Error:", error);
        onChunk("❌ Error fetching response from AI.");
    }
};

export default pistonInstance;