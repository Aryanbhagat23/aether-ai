// js/aiWriter.js

// This file contains all the functionality for the AI Creative Writer tool.

document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const lengthSelect = document.getElementById('length-select');
    const genreSelect = document.getElementById('genre-select');
    const toneSelect = document.getElementById('tone-select');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const summarizeBtn = document.getElementById('summarize-btn');
    const continueBtn = document.getElementById('continue-btn');
    const rewriteBtn = document.getElementById('rewrite-btn');
    const altEndingBtn = document.getElementById('alt-ending-btn');
    const changePerspectiveBtn = document.getElementById('change-perspective-btn');
    const generateCharacterBtn = document.getElementById('generate-character-btn');
    const suggestTitleBtn = document.getElementById('suggest-title-btn');
    const generateDialogueBtn = document.getElementById('generate-dialogue-btn');
    const elaborateBtn = document.getElementById('elaborate-btn');
    const plotTwistBtn = document.getElementById('plot-twist-btn');
    const newCharacterBtn = document.getElementById('new-character-btn');
    const inspirationSelect = document.getElementById('inspiration-select');
    
    const loadingIndicator = document.getElementById('loading-indicator');
    const outputContainer = document.getElementById('output-container');
    const outputText = document.getElementById('output-text');
    const wordCountDisplay = document.getElementById('word-count');
    const messageBox = document.getElementById('message-box');

    let lastGeneratedText = '';

    // Data for dynamic inspiration prompts
    const inspirationPrompts = {
        'none': [],
        'fantasy': [
            { text: "A young wizard who can only create inanimate objects finds a powerful spellbook.", value: "A young wizard who can only create inanimate objects finds a powerful spellbook." },
            { text: "A forgotten knight's shield begins to glow with an ancient power in a time of need.", value: "A forgotten knight's shield begins to glow with an ancient power in a time of need." },
            { text: "A rogue faerie is tasked with protecting a human child from a dark curse.", value: "A rogue faerie is tasked with protecting a human child from a dark curse." }
        ],
        'sci-fi': [
            { text: "A lost robot discovers a new kind of friendship on a dusty planet.", value: "A lost robot discovers a new kind of friendship on a dusty planet." },
            { text: "The last person on a space station receives a mysterious message that isn't from Earth.", value: "The last person on a space station receives a mysterious message that isn't from Earth." },
            { text: "A group of space miners discovers an alien artifact that can manipulate time.", value: "A group of space miners discovers an alien artifact that can manipulate time." }
        ],
        'mystery': [
            { text: "The last person to see a famous detective alive is a talking crow.", value: "The last person to see a famous detective alive is a talking crow." },
            { text: "A private investigator is hired to find a priceless painting that has mysteriously vanished from a sealed room.", value: "A private investigator is hired to find a priceless painting that has mysteriously vanished from a sealed room." },
            { text: "An amateur sleuth must solve a crime that was seemingly committed by a ghost.", value: "An amateur sleuth must solve a crime that was seemingly committed by a ghost." }
        ],
        'comedy': [
            { text: "A time traveler accidentally brings a caveman to a modern-day office job interview.", value: "A time traveler accidentally brings a caveman to a modern-day office job interview." },
            { text: "A group of clumsy superheroes must learn to work together to defeat a villain who is even more incompetent than they are.", value: "A group of clumsy superheroes must learn to work together to defeat a villain who is even more incompetent than they are." },
            { text: "A dog is convinced he is a human and tries to get a job at a local bank.", value: "A dog is convinced he is a human and tries to get a job at a local bank." }
        ],
        'horror': [
            { text: "A group of friends gets trapped in an abandoned cabin where a sinister presence lurks.", value: "A group of friends gets trapped in an abandoned cabin where a sinister presence lurks." },
            { text: "A child's imaginary friend turns out to be very real and very evil.", value: "A child's imaginary friend turns out to be very real and very evil." },
            { text: "An old dollhouse seems to predict gruesome future events for the family that owns it.", value: "An old dollhouse seems to predict gruesome future events for the family that owns it." }
        ]
    };

    function populateInspirationPrompts(genre) {
        inspirationSelect.innerHTML = '<option value="" selected>Choose a prompt</option>';
        const prompts = inspirationPrompts[genre] || [];
        prompts.forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.value;
            option.textContent = prompt.text;
            inspirationSelect.appendChild(option);
        });
    }

    function showMessage(message, type = 'info') {
        messageBox.textContent = message;
        messageBox.className = `p-4 rounded-xl text-sm mt-4 text-center block`;
        if (type === 'error') {
            messageBox.classList.remove('bg-blue-200', 'bg-green-200');
            messageBox.classList.add('bg-red-200', 'text-red-800');
        } else if (type === 'success') {
            messageBox.classList.remove('bg-blue-200', 'bg-red-200');
            messageBox.classList.add('bg-green-200', 'text-green-800');
        } else {
            messageBox.classList.remove('bg-green-200', 'bg-red-200');
            messageBox.classList.add('bg-blue-200', 'text-blue-800');
        }
        messageBox.style.display = 'block';
    }

    function toggleFeatureButtons(enabled) {
        summarizeBtn.disabled = !enabled;
        continueBtn.disabled = !enabled;
        rewriteBtn.disabled = !enabled;
        altEndingBtn.disabled = !enabled;
        changePerspectiveBtn.disabled = !enabled;
        generateCharacterBtn.disabled = !enabled;
        suggestTitleBtn.disabled = !enabled;
        generateDialogueBtn.disabled = !enabled;
        elaborateBtn.disabled = !enabled;
        plotTwistBtn.disabled = !enabled;
        newCharacterBtn.disabled = !enabled;
    }

    function updateWordCount(text) {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        wordCountDisplay.textContent = `Word Count: ${words}`;
    }
    
    async function generateStory(prompt) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        loadingIndicator.classList.remove('hidden');
        outputContainer.classList.add('hidden');
        toggleFeatureButtons(false);
        showMessage('Thinking about your story...', 'info');

        const selectedLength = lengthSelect.value;
        let lengthPrompt = '';
        switch (selectedLength) {
            case 'short':
                lengthPrompt = 'Write a concise short story, around 1-2 paragraphs.';
                break;
            case 'medium':
                lengthPrompt = 'Write an engaging short story, around 3-4 paragraphs.';
                break;
            case 'long':
                lengthPrompt = 'Write a detailed story, around 5-6 paragraphs.';
                break;
        }

        const selectedTone = toneSelect.value;
        let tonePrompt = '';
        if (selectedTone !== 'none') {
            tonePrompt = ` Write the story with a ${selectedTone} tone.`;
        }

        const fullPrompt = `${lengthPrompt} Use the following idea: ${prompt}${tonePrompt}`;

        try {
            const data = await callServerApi('generate-text', { prompt: fullPrompt });
            const generatedText = data.text;
            lastGeneratedText = generatedText;
            outputText.innerHTML = generatedText.replace(/\n/g, '<br>');
            updateWordCount(generatedText);
            outputContainer.classList.remove('hidden');
            toggleFeatureButtons(true);
            showMessage('Story generated successfully!', 'success');

        } catch (error) {
            console.error('An error occurred:', error);
            showMessage(`Sorry, something went wrong. Please ensure the server is running.`, 'error');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Story';
            loadingIndicator.classList.add('hidden');
        }
    }

    // Event listener for the "Generate Story" button
    generateBtn.addEventListener('click', () => {
        const prompt = promptInput.value.trim();
        if (prompt) {
            generateStory(prompt);
        } else {
            showMessage('Please enter a prompt to generate a story.', 'error');
        }
    });

    // Event listener for the "Clear" button
    clearBtn.addEventListener('click', () => {
        promptInput.value = '';
        outputText.innerHTML = '';
        updateWordCount('');
        outputContainer.classList.add('hidden');
        messageBox.style.display = 'none';
        toggleFeatureButtons(false);
        inspirationSelect.value = '';
        genreSelect.value = 'none';
        lengthSelect.value = 'medium';
        toneSelect.value = 'none'; // Reset tone selector
        populateInspirationPrompts('none'); // Reset inspiration prompts
    });

    // Event listener for the inspiration dropdown
    inspirationSelect.addEventListener('change', (e) => {
        promptInput.value = e.target.value;
    });

    // Event listener for the genre dropdown
    genreSelect.addEventListener('change', (e) => {
        const selectedGenre = e.target.value;
        populateInspirationPrompts(selectedGenre);
    });

    summarizeBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Summarizing the story...', 'info');
        try {
            const summaryPrompt = `Summarize the following story in a single, concise paragraph:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: summaryPrompt });
            const summarizedText = data.text;
            outputText.innerHTML = summarizedText.replace(/\n/g, '<br>');
            updateWordCount(summarizedText);
            showMessage('Story summarized successfully!', 'success');
        } catch (error) {
            console.error('An error occurred during summarization:', error);
            showMessage(`Failed to summarize the story.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    continueBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Continuing the story...', 'info');
        try {
            const continuePrompt = `Continue the following story by writing one more paragraph. Do not rewrite the whole story, just add a new paragraph at the end:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: continuePrompt });
            const continuedText = data.text;
            lastGeneratedText += `\n\n${continuedText}`;
            outputText.innerHTML = lastGeneratedText.replace(/\n/g, '<br>');
            updateWordCount(lastGeneratedText);
            showMessage('Story continued successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while continuing the story:', error);
            showMessage(`Failed to continue the story.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    rewriteBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        const selectedGenre = genreSelect.value;
        if (selectedGenre === 'none') { showMessage('Please select a genre to change.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage(`Rewriting story in ${selectedGenre} style...`, 'info');
        try {
            const rewritePrompt = `Rewrite the following story in the style of a ${selectedGenre} story. Focus on the tone and atmosphere:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: rewritePrompt });
            const rewrittenText = data.text;
            lastGeneratedText = rewrittenText;
            outputText.innerHTML = rewrittenText.replace(/\n/g, '<br>');
            updateWordCount(rewrittenText);
            showMessage('Story genre changed successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while rewriting the story:', error);
            showMessage(`Failed to rewrite the story.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    altEndingBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Generating a new ending...', 'info');
        try {
            const altEndingPrompt = `Write a completely different and surprising ending for the following story. The ending should be a single paragraph:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: altEndingPrompt });
            const altEndingText = data.text;
            const storyParagraphs = lastGeneratedText.split(/\n\n/);
            const storyBody = storyParagraphs.slice(0, storyParagraphs.length - 1).join('\n\n');
            const newStoryWithEnding = `${storyBody}\n\n${altEndingText}`;
            lastGeneratedText = newStoryWithEnding;
            outputText.innerHTML = newStoryWithEnding.replace(/\n/g, '<br>');
            updateWordCount(newStoryWithEnding);
            showMessage('New ending generated successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while generating the ending:', error);
            showMessage(`Failed to generate a new ending.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    changePerspectiveBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Changing story perspective...', 'info');
        try {
            const perspectivePrompt = `Rewrite the following story in the third-person point of view (using "he," "she," or "they" instead of "I" or "we"). Maintain the original plot and tone:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: perspectivePrompt });
            const rewrittenText = data.text;
            lastGeneratedText = rewrittenText;
            outputText.innerHTML = rewrittenText.replace(/\n/g, '<br>');
            updateWordCount(rewrittenText);
            showMessage('Story perspective changed successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while changing perspective:', error);
            showMessage(`Failed to change the story's perspective.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    generateCharacterBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Generating character profile...', 'info');
        try {
            const characterPrompt = `Based on the following story, provide a detailed character profile for the main protagonist. Include their personality, a brief physical description, motivations, and a short background. Format the output with clear headings for each section. Here is the story:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: characterPrompt });
            const characterProfileText = data.text;
            outputText.innerHTML = characterProfileText.replace(/\n/g, '<br>');
            updateWordCount(characterProfileText);
            showMessage('Character profile generated successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while generating the character profile:', error);
            showMessage(`Failed to generate a character profile.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    suggestTitleBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Suggesting titles...', 'info');
        try {
            const titlePrompt = `Suggest five creative and engaging titles for the following story. The output should be a simple numbered list:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: titlePrompt });
            const titlesText = data.text;
            outputText.innerHTML = titlesText.replace(/\n/g, '<br>');
            updateWordCount(titlesText);
            showMessage('Titles suggested successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while suggesting titles:', error);
            showMessage(`Failed to suggest titles.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    generateDialogueBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Generating dialogue scene...', 'info');
        try {
            const dialoguePrompt = `Based on the following story, write a short dialogue scene between the main characters. The dialogue should be natural and move the plot forward. Do not include a full narrative, just the dialogue scene. Here is the story:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: dialoguePrompt });
            const dialogueText = data.text;
            outputText.innerHTML = dialogueText.replace(/\n/g, '<br>');
            updateWordCount(dialogueText);
            showMessage('Dialogue generated successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while generating dialogue:', error);
            showMessage(`Failed to generate dialogue.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });
    
    elaborateBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Elaborating on the scene...', 'info');
        try {
            const elaboratePrompt = `Expand on the last scene of the following story by adding more detail, sensory descriptions, and character thoughts to make it more immersive. Do not rewrite the entire story, just provide the expanded scene. Here is the story:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: elaboratePrompt });
            const elaboratedText = data.text;
            const storyParagraphs = lastGeneratedText.split(/\n\n/);
            if (storyParagraphs.length > 0) {
                const storyBody = storyParagraphs.slice(0, storyParagraphs.length - 1).join('\n\n');
                const newStory = `${storyBody}\n\n${elaboratedText}`;
                lastGeneratedText = newStory;
                outputText.innerHTML = newStory.replace(/\n/g, '<br>');
                updateWordCount(newStory);
            } else {
                lastGeneratedText = elaboratedText;
                outputText.innerHTML = elaboratedText.replace(/\n/g, '<br>');
                updateWordCount(elaboratedText);
            }
            showMessage('Scene elaborated successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while elaborating the scene:', error);
            showMessage(`Failed to elaborate on the scene.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    plotTwistBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Suggesting a plot twist...', 'info');
        try {
            const plotTwistPrompt = `Based on the following story, suggest a surprising and creative plot twist that could change the direction of the narrative. The twist should be a single paragraph. Here is the story:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: plotTwistPrompt });
            const plotTwistText = data.text;
            outputText.innerHTML = plotTwistText.replace(/\n/g, '<br>');
            updateWordCount(plotTwistText);
            showMessage('Plot twist suggested successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while suggesting a plot twist:', error);
            showMessage(`Failed to suggest a plot twist.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    newCharacterBtn.addEventListener('click', async () => {
        if (!lastGeneratedText) { showMessage('Please generate a story first.', 'error'); return; }
        toggleFeatureButtons(false);
        showMessage('Suggesting a new character...', 'info');
        try {
            const newCharacterPrompt = `Based on the following story, suggest a new character that would be interesting to introduce. Provide a name, a brief personality description, and their role in the story. Format the output with clear headings. Here is the story:\n\n${lastGeneratedText}`;
            const data = await callServerApi('generate-text', { prompt: newCharacterPrompt });
            const newCharacterText = data.text;
            outputText.innerHTML = newCharacterText.replace(/\n/g, '<br>');
            updateWordCount(newCharacterText);
            showMessage('New character suggested successfully!', 'success');
        } catch (error) {
            console.error('An error occurred while suggesting a new character:', error);
            showMessage(`Failed to suggest a new character.`, 'error');
        } finally { toggleFeatureButtons(true); }
    });

    // Event listener for the "Generate Story" button
    generateBtn.addEventListener('click', () => {
        const prompt = promptInput.value.trim();
        if (prompt) {
            generateStory(prompt);
        } else {
            showMessage('Please enter a prompt to generate a story.', 'error');
        }
    });

    // Event listener for the "Clear" button
    clearBtn.addEventListener('click', () => {
        promptInput.value = '';
        outputText.innerHTML = '';
        updateWordCount('');
        outputContainer.classList.add('hidden');
        messageBox.style.display = 'none';
        toggleFeatureButtons(false);
        inspirationSelect.value = '';
        genreSelect.value = 'none';
        lengthSelect.value = 'medium';
        toneSelect.value = 'none'; // Reset tone selector
        populateInspirationPrompts('none'); // Reset inspiration prompts
    });

    // Event listener for the inspiration dropdown
    inspirationSelect.addEventListener('change', (e) => {
        promptInput.value = e.target.value;
    });

    // Event listener for the genre dropdown
    genreSelect.addEventListener('change', (e) => {
        const selectedGenre = e.target.value;
        populateInspirationPrompts(selectedGenre);
    });

    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateBtn.click();
        }
    });
});
