// js/blogOutlineMaker.js

// This file contains all the functionality for the Blog Outline Maker tool.

document.addEventListener('DOMContentLoaded', () => {
    const blogOutlinePromptInput = document.getElementById('blog-outline-prompt-input');
    const generateBlogOutlineBtn = document.getElementById('generate-blog-outline-btn');
    const blogToneSelect = document.getElementById('blog-tone-select');
    const targetAudienceInput = document.getElementById('target-audience-input');
    const blogOutlineLoadingIndicator = document.getElementById('blog-outline-loading-indicator');
    const blogOutlineOutputContainer = document.getElementById('blog-outline-output-container');
    const blogOutlineOutputText = document.getElementById('blog-outline-output-text');
    const blogOutlineMessageBox = document.getElementById('blog-outline-message-box');
    const blogOutlineWordCount = document.getElementById('blog-outline-word-count');
    const clearBlogOutlineBtn = document.getElementById('clear-blog-outline-btn');

    // Reusable function to show messages for the blog outline tool
    function showBlogOutlineMessage(message, type = 'info') {
        blogOutlineMessageBox.textContent = message;
        blogOutlineMessageBox.className = `p-4 rounded-xl text-sm mt-4 text-center block`;
        if (type === 'error') {
            blogOutlineMessageBox.classList.remove('bg-blue-200', 'bg-green-200');
            blogOutlineMessageBox.classList.add('bg-red-200', 'text-red-800');
        } else if (type === 'success') {
            blogOutlineMessageBox.classList.remove('bg-blue-200', 'bg-red-200');
            blogOutlineMessageBox.classList.add('bg-green-200', 'text-green-800');
        } else {
            blogOutlineMessageBox.classList.remove('bg-green-200', 'bg-red-200');
            blogOutlineMessageBox.classList.add('bg-blue-200', 'text-blue-800');
        }
        blogOutlineMessageBox.style.display = 'block';
    }

    // Function to update word count for the blog outline tool
    function updateBlogOutlineWordCount(text) {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        blogOutlineWordCount.textContent = `Word Count: ${words}`;
    }

    // Function to handle blog outline generation
    async function generateBlogOutline(prompt) {
        generateBlogOutlineBtn.disabled = true;
        generateBlogOutlineBtn.textContent = 'Generating...';
        blogOutlineLoadingIndicator.classList.remove('hidden');
        blogOutlineOutputContainer.classList.add('hidden');
        showBlogOutlineMessage('Generating your blog outline...', 'info');

        const selectedTone = blogToneSelect.value;
        const targetAudience = targetAudienceInput.value.trim();
        let blogPrompt = `Create a detailed and well-structured blog post outline for the following topic. The outline should include a title, an introduction, 3-4 main sections with sub-points, and a conclusion.`;

        if (selectedTone !== 'Informative') {
            blogPrompt += ` Use a ${selectedTone} tone.`;
        }
        if (targetAudience) {
            blogPrompt += ` The target audience is ${targetAudience}.`;
        }
        
        const fullPrompt = `${blogPrompt}\n\nTopic: ${prompt}`;

        try {
            const data = await callServerApi('generate-text', { prompt: fullPrompt });
            const generatedText = data.text;
            
            // Clean up the generated text to remove Markdown list symbols
            const cleanedText = generatedText.replace(/\*/g, '').replace(/^- /gm, '');

            blogOutlineOutputText.innerHTML = cleanedText.replace(/\n/g, '<br>');
            blogOutlineOutputContainer.classList.remove('hidden');
            updateBlogOutlineWordCount(cleanedText);
            showBlogOutlineMessage('Blog outline generated successfully!', 'success');
        } catch (error) {
            console.error('An error occurred:', error);
            showBlogOutlineMessage(`Sorry, something went wrong. Please ensure the server is running.`, 'error');
        } finally {
            generateBlogOutlineBtn.disabled = false;
            generateBlogOutlineBtn.textContent = 'Generate Blog Outline';
            blogOutlineLoadingIndicator.classList.add('hidden');
        }
    }

    // Event listener for the "Generate Blog Outline" button
    generateBlogOutlineBtn.addEventListener('click', () => {
        const prompt = blogOutlinePromptInput.value.trim();
        if (prompt) {
            generateBlogOutline(prompt);
        } else {
            showBlogOutlineMessage('Please enter a topic to generate a blog outline.', 'error');
        }
    });

    // Event listener for the "Clear" button for the blog outline tool
    clearBlogOutlineBtn.addEventListener('click', () => {
        blogOutlinePromptInput.value = '';
        blogToneSelect.value = 'Informative';
        targetAudienceInput.value = '';
        blogOutlineOutputText.innerHTML = '';
        updateBlogOutlineWordCount('');
        blogOutlineOutputContainer.classList.add('hidden');
        blogOutlineMessageBox.style.display = 'none';
        generateBlogOutlineBtn.disabled = false;
    });

    // Event listener for the Enter key in the textarea
    blogOutlinePromptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateBlogOutlineBtn.click();
        }
    });
});
