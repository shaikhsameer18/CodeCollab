import axios, { AxiosInstance } from "axios";

// ✅ Piston API Configuration (For Code Execution)
const pistonBaseUrl = "https://emkc.org/api/v2/piston";
const pistonInstance: AxiosInstance = axios.create({
    baseURL: pistonBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Use environment variables for API endpoint
const API_URL = import.meta.env.VITE_BACKEND_URL;
console.log("API URL being used:", API_URL); // Debug log to see which URL is being used
const API_BASE_URL = `${API_URL}/api/chatbot`;

// One id per browser, so the server can keep each visitor's conversation
// history separate instead of a single history shared by everyone.
function getChatSessionId(): string {
    const key = "codecollab_chat_session";
    let id = localStorage.getItem(key);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(key, id);
    }
    return id;
}

export const sendMessageToChatbot = async (message: string, onChunk: (chunk: string) => void): Promise<void> => {
    try {
        console.log("Sending message to:", `${API_BASE_URL}/ask`);

        const response = await fetch(`${API_BASE_URL}/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Chat-Session": getChatSessionId(),
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error Status: ${response.status}`, errorText);
            throw new Error(`API Error: ${response.status} - ${response.statusText}. Details: ${errorText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("Response body is empty or reader couldn't be obtained");
        }

        const decoder = new TextDecoder();

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            try {
                const lines = chunk.split("\n").filter((line) => line.trim().startsWith("data:"));

                if (lines.length === 0 && chunk.trim()) {
                    // If no data: prefix but there is content, try to use it directly
                    onChunk(chunk);
                    continue;
                }

                for (const line of lines) {
                    const data = line.replace("data:", "").trim();
                    if (data) {
                        try {
                            const parsedData = JSON.parse(data);
                            onChunk(parsedData.content || parsedData); // Try to get content or use whole object
                        } catch (parseError) {
                            // If the data isn't JSON, just use it as-is
                            onChunk(data);
                        }
                    }
                }
            } catch (parseError) {
                console.error("Error parsing chunk:", parseError);
                onChunk(chunk); // Send the raw chunk as fallback
            }
        }
    } catch (error) {
        console.error("❌ API Error:", error);
        onChunk(`❌ Error fetching response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export default pistonInstance;