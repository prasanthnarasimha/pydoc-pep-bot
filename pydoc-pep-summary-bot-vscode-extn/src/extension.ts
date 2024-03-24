import * as vscode from 'vscode';
import Configuration, { OpenAI } from 'openai'
import OpenAIApi from 'openai'
import ChatCompletionRequestMessageRoleEnum from 'openai'
import axios, { AxiosError } from 'axios';
import cheerio from 'cheerio';
import { Console } from 'console';

export async function activate(context: vscode.ExtensionContext) {
    const secretStorage = context.secrets;

    // Prompt the user for the API key
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your OpenAI API key',
        password: true, // Hide the input characters
    });

    if (apiKey) {
        // Store the API key securely
        await secretStorage.store('openaiApiKey', apiKey);
    } else {
        vscode.window.showErrorMessage('API key not provided. Extension will not work correctly.');
        return;
    }

    const hoverProvider = vscode.languages.registerHoverProvider('python', {
        async provideHover(document, position, token) {
            const wordRange = document.getWordRangeAtPosition(position);
            const word = document.getText(wordRange);

            // Retrieve the API key from secure storage
            const apiKey = await secretStorage.get('openaiApiKey');

            if (!apiKey) {
                vscode.window.showErrorMessage('API key not found. Extension will not work correctly.');
                return;
            }

            // Initialize the OpenAI API with the retrieved API key
            // const configuration = new Configuration({ apiKey });
            const openai = new OpenAI({ apiKey });

            try {
                // Generate the first system prompt to get PEP numbers
                const prompt1 = `You are an AI assistant that specializes in looking up Python Enhancement Proposals (PEPs) 
                related to specific Python operators and functions. 
                Given the following operator/function, please return the PEP numbers
                that are most closely related as a JSON array. If no closely related PEPs are found, return an empty array.
                make sure to only respond with a JSON list and nothing else as I intend to load the response as a JSON

                Example Response 1: ["3100", "2953"]
                Example Response 2: []
                
                Operators/functions: ${word}`;

                // Call the OpenAI API to generate the response for the first prompt
                const completion1 = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: prompt1,
                        },
                    ],
                    max_tokens: 50,
                    n: 1,
                    temperature: 0.7,
                });

                // Extract the PEP numbers from the JSON response
                const jsonResponse = completion1.choices[0].message?.content?.trim() || '{}';
                const { pep_numbers = []} = JSON.parse(jsonResponse);
               
                // Scrape the PEP webpages for the obtained PEP numbers
                const pepContexts: string[] = [];
                for (const pepNumber of pep_numbers) {
                    const pepUrl = `https://peps.python.org/pep-${pepNumber.trim()}/`;
                    try {
                        const response = await axios.get(pepUrl);
                        const $ = cheerio.load(response.data);
                        const pepContent = $('body').text();
                        pepContexts.push(pepContent);
                    } catch (error) {
                        if (error instanceof AxiosError && error.response?.status === 404) {
                            console.warn(`PEP ${pepNumber} not found. Skipping...`);
                        } else {
                            console.error('Error fetching PEP webpage:', error);
                        }
                        pepContexts.push("No relative pep found or unable to scrape webpage")
                    }

                }

                // Generate the second system prompt with the scraped PEP contexts
                const prompt2 = `PEP contexts:
                ${pepContexts.join('\n\n')}

                You are an AI coding assistant that generates detailed summaries of Python operators and functions,
                using related Python Enhancement Proposals (PEPs) as context.
                
                For each operator/function in the following comma-separated list, please generate a human readable summary that includes:
                1. General description 
                2. Code examples
                3. Best practices and anti-patterns
                4. Summary of additions/changes in the provided PEPs
                
                
                Operators/functions: ${word}

                Respond in Markdown format for better readability.`;

                // Call the OpenAI API to generate the response for the second prompt
                const completion2 = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: prompt2,
                        },
                    ],
                    max_tokens: 300,
                    n: 1,
                    temperature: 0.7,
                });

                // Extract the generated response
                const response = completion2.choices[0].message?.content?.trim() || '';

                // Create a hover message with the generated response
                const hoverMessage = new vscode.MarkdownString(response);
                return new vscode.Hover(hoverMessage);
            } catch (error) {
                console.error('Error generating response:', error);
                const errorMessage = 'An error occurred while generating the response.' + error;
                const hoverMessage = new vscode.MarkdownString(errorMessage);
                return new vscode.Hover(hoverMessage);
            }
        }
    });

    context.subscriptions.push(hoverProvider);
}