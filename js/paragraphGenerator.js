// js/paragraphGenerator.js

// This file contains all the functionality for the AI Paragraph Generator tool.

document.addEventListener('DOMContentLoaded', () => {
    const paragraphPromptInput = document.getElementById('paragraph-prompt-input');
    const generateParagraphBtn = document.getElementById('generate-paragraph-btn');
    const paragraphLoadingIndicator = document.getElementById('paragraph-loading-indicator');
    const paragraphOutputContainer = document.getElementById('paragraph-output-container');
    const paragraphOutputText = document.getElementById('paragraph-output-text');
    const paragraphMessageBox = document.getElementById('paragraph-message-box');
    const paragraphWordCount = document.getElementById('paragraph-word-count');
    const clearParagraphBtn = document.getElementById('clear-paragraph-btn');

    // Reusable function to show messages for the paragraph tool
    function showParagraphMessage(message, type = 'info') {
        paragraphMessageBox.textContent = message;
        paragraphMessageBox.className = `p-4 rounded-xl text-sm mt-4 text-center block`;
        if (type === 'error') {
            paragraphMessageBox.classList.remove('bg-blue-200', 'bg-green-200');
            paragraphMessageBox.classList.add('bg-red-200', 'text-red-800');
        } else if (type === 'success') {
            paragraphMessageBox.classList.remove('bg-blue-200', 'bg-red-200');
            paragraphMessageBox.classList.add('bg-green-200', 'text-green-800');
        } else {
            paragraphMessageBox.classList.remove('bg-green-200', 'bg-red-200');
            paragraphMessageBox.classList.add('bg-blue-200', 'text-blue-800');
        }
        paragraphMessageBox.style.display = 'block';
    }

    // Function to update word count for the paragraph tool
    function updateParagraphWordCount(text) {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        paragraphWordCount.textContent = `Word Count: ${words}`;
    }

    // Function to handle paragraph generation
    async function generateParagraph(prompt) {
        generateParagraphBtn.disabled = true;
        generateParagraphBtn.textContent = 'Generating...';
        paragraphLoadingIndicator.classList.remove('hidden');
        paragraphOutputContainer.classList.add('hidden');
        showParagraphMessage('Generating your paragraph...', 'info');

        const fullPrompt = `Write a detailed, informative, and cohesive paragraph about the following topic: ${prompt}`;

        try {
            const data = await callServerApi('generate-text', { prompt: fullPrompt });
            const generatedText = data.text;
            paragraphOutputText.innerHTML = generatedText.replace(/\n/g, '<br>');
            paragraphOutputContainer.classList.remove('hidden');
            updateParagraphWordCount(generatedText);
            showParagraphMessage('Paragraph generated successfully!', 'success');
        } catch (error) {
            console.error('An error occurred:', error);
            showParagraphMessage(`Sorry, something went wrong. Please ensure the server is running.`, 'error');
        } finally {
            generateParagraphBtn.disabled = false;
            generateParagraphBtn.textContent = 'Generate Paragraph';
            paragraphLoadingIndicator.classList.add('hidden');
        }
    }

    // Event listener for the "Generate Paragraph" button
    generateParagraphBtn.addEventListener('click', () => {
        const prompt = paragraphPromptInput.value.trim();
        if (prompt) {
            generateParagraph(prompt);
        } else {
            showParagraphMessage('Please enter a topic to generate a paragraph.', 'error');
        }
    });

    // Event listener for the "Clear" button for the paragraph tool
    clearParagraphBtn.addEventListener('click', () => {
        paragraphPromptInput.value = '';
        paragraphOutputText.innerHTML = '';
        updateParagraphWordCount('');
        paragraphOutputContainer.classList.add('hidden');
        paragraphMessageBox.style.display = 'none';
        generateParagraphBtn.disabled = false;
    });

    // Event listener for the Enter key in the textarea
    paragraphPromptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateParagraphBtn.click();
        }
    });
});
