import { fetch } from 'undici';
import { TextDecoderStream } from 'node:stream/web';
import { Observable } from 'rxjs';

/**
 * Create asnyc request to CodeAssistant api gets a response.
 * @param question is that want to ask to CodeAssistant.
 * @param apikey of CodeAssistant.
 * @returns 
 */
export async function askToCodeAssistant(query: string | undefined, apiKey: string) {
    try {
        // 👇️ const response: Response
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: query }],
                temperature: 0.7
            }),
            headers: {
                "Content-Type": 'application/json',
                authorization: 'Bearer ' + apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        const result: any = (await response.json());

        return result.choices[0].message.content;
    } catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
        } else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
        }
    }
}

/**
 * Create asnyc request to CodeAssistant api and gets straem.
 * @param question is that want to ask to CodeAssistant.
 * @param apikey of CodeAssistant.
 * @param temperature.
 * @returns 
 */
export function askToCodeAssistantAsStream(query: string | undefined, apiKey: string, temperature: number): Observable<string> {

    return new Observable<string>(observer => {
        // 👇️ const response: Response
        const response = fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: query }],
                // temperature: 0.7,
                temperature: Number(temperature),
                stream: true
            }),
            headers: {
                'Content-Type': 'application/json',
                authorization: 'Bearer ' + apiKey,
            },
        });

        let content = '';
        response.then(async res => {
            const textStream = res.body?.pipeThrough(new TextDecoderStream());
            if (textStream) {
                for await (const chunk of textStream) {
                    const eventStr = chunk.split('\n\n');
                    for (let i = 0; i < eventStr.length; i++) {
                        const str = eventStr[i];
                        if (str === 'data: [DONE]') {
                            break;
                        }
                        if (str && str.slice(0, 6) === 'data: ') {
                            const jsonStr = str.slice(6);
                            const data: any = JSON.parse(jsonStr);
                            const thisContent = data.choices[0].delta?.content || '';
                            content += thisContent;
                            observer.next(thisContent);
                        }
                    }
                }
            }
        }).catch((err: Error) => {
            observer.error(err?.message);
        });
    });
}

export async function promptToTextDavinci003(prompt: string, apikey: string) {
    try {
        // 👇️ const response: Response
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 2048,
                temperature: 0.0,
                top_p: 0.1
            }),
            headers: {
                "Content-Type": 'application/json',
                authorization: 'Bearer ' + apikey,
            },
        });

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        const result: any = (await response.json());

        return result.choices[0].text;
    } catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
        } else {
            console.log('unexpected error: ', error);
        }
        throw error;
    }
}

/**
 * Create asnyc request to CodeAssistant api to generate a new images.
 * @param prompt 
 * @param apiKey 
 * @param n 
 * @param size 
 * @returns 
 */
export async function imageGenerationeFromCodeAssistant(prompt: string | undefined, apiKey: string, n: number = 1, size: string = "1024x1024") {
    try {
        // 👇️ const response: Response
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            body: JSON.stringify({
                prompt: prompt,
                n: Number(n),
                size: size
            }),
            headers: {
                "Content-Type": 'application/json',
                authorization: 'Bearer ' + apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        const result: any = (await response.json());

        return result.data;
    } catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
        } else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
        }
    }
}