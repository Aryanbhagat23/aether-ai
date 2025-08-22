// js/textToImage.js

// This file contains the logic for the Text to Image tool.

document.addEventListener('DOMContentLoaded', () => {
    const imagePromptInput = document.getElementById('image-prompt-input');
    const generateImageBtn = document.getElementById('generate-image-btn');
    const clearImageBtn = document.getElementById('clear-image-btn');
    const imageOutputContainer = document.getElementById('image-output-container');
    const generatedImage = document.getElementById('generated-image');
    const imageMessageBox = document.getElementById('image-message-box');
    const imageLoadingIndicator = document.getElementById('image-loading-indicator');

    function showImageMessage(message, type = 'info') {
        imageMessageBox.textContent = message;
        imageMessageBox.className = `p-4 rounded-xl text-sm mt-4 text-center block`;
        if (type === 'error') {
            imageMessageBox.classList.remove('bg-blue-200', 'bg-green-200');
            imageMessageBox.classList.add('bg-red-200', 'text-red-800');
        } else if (type === 'success') {
            imageMessageBox.classList.remove('bg-blue-200', 'bg-red-200');
            imageMessageBox.classList.add('bg-green-200', 'text-green-800');
        } else {
            imageMessageBox.classList.remove('bg-green-200', 'bg-red-200');
            imageMessageBox.classList.add('bg-blue-200', 'text-blue-800');
        }
        imageMessageBox.style.display = 'block';
    }

    async function generateImage(prompt) {
        generateImageBtn.disabled = true;
        generateImageBtn.textContent = 'Generating...';
        imageLoadingIndicator.classList.remove('hidden');
        imageOutputContainer.classList.add('hidden');
        showImageMessage('Generating your image...', 'info');

        try {
            const data = await callServerApi('generate-image', { prompt });
            if (data.image) {
                generatedImage.src = data.image;
                imageOutputContainer.classList.remove('hidden');
                imageLoadingIndicator.classList.add('hidden');
                showImageMessage('Image generated successfully!', 'success');
            } else {
                throw new Error('Image data was not returned.');
            }
        } catch (error) {
            console.error('An error occurred during image generation:', error);
            showImageMessage(`Sorry, something went wrong. Please ensure the server is running.`, 'error');
        } finally {
            generateImageBtn.disabled = false;
            generateImageBtn.textContent = 'Generate Image';
        }
    }

    generateImageBtn.addEventListener('click', () => {
        const prompt = imagePromptInput.value.trim();
        if (prompt) {
            generateImage(prompt);
        } else {
            showImageMessage('Please enter a prompt to generate an image.', 'error');
        }
    });

    clearImageBtn.addEventListener('click', () => {
        imagePromptInput.value = '';
        generatedImage.src = '';
        imageOutputContainer.classList.add('hidden');
        imageMessageBox.style.display = 'none';
    });
    
    imagePromptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateImageBtn.click();
        }
    });
});
