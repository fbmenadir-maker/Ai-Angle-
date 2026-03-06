import { GoogleGenAI } from "@google/genai";

export async function generateImageFromPrompt(
  apiKey: string,
  base64Data: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      { type: 'image', data: base64Data, mimeType },
      { type: 'text', text: prompt }
    ]
  });

  const part = response?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part) throw new Error("No image generated");

  return `data:image/png;base64,${part.inlineData.data}`;
}      return res.status(response.status).json(data);
    }

    res.status(200).json({ imageUrl: data.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}    res.status(200).json({ imageUrl: data.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
