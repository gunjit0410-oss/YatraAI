/**
 * Yatra AI Interactive Floating Assistant Script
 * Directly connects frontend user prompts to Django backend API -> Google Gemini API.
 */

document.addEventListener("DOMContentLoaded", function() {
    const launcher = document.getElementById("yatra-chat-launcher");
    const chatWindow = document.getElementById("yatra-chat-window");
    const closeBtn = document.getElementById("yatra-chat-close");
    const chatForm = document.getElementById("yatra-chat-form");
    const chatInput = document.getElementById("yatra-chat-input");
    const chatSendBtn = document.getElementById("yatra-chat-send");
    const messagesContainer = document.getElementById("yatra-chat-messages");
    const typingIndicator = document.getElementById("yatra-typing-indicator");
    const quickActions = document.getElementById("yatra-quick-actions");
    const unreadDot = document.querySelector(".unread-dot");

    // Conversation history store
    const conversationHistory = [];
    let isProcessing = false;

    if (!launcher || !chatWindow) return;

    // Helper: Get CSRF token from cookie or hidden form field
    function getCsrfToken() {
        const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (csrfInput) return csrfInput.value;

        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === ('csrftoken=')) {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue || '';
    }

    // Toggle Chat Window
    function toggleChat() {
        const isHidden = chatWindow.classList.contains("d-none");
        if (isHidden) {
            chatWindow.classList.remove("d-none");
            if (unreadDot) unreadDot.style.display = "none";
            chatInput.focus();
            scrollToBottom();
        } else {
            chatWindow.classList.add("d-none");
        }
    }

    launcher.addEventListener("click", toggleChat);
    if (closeBtn) closeBtn.addEventListener("click", toggleChat);

    // Scroll to bottom of message container
    function scrollToBottom() {
        const chatBody = document.getElementById("yatra-chat-body");
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    // Enhanced markdown format parser for clean Gemini AI response rendering
    function parseMarkdown(text) {
        if (!text) return "";
        let formatted = text
            // Escape HTML tags
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            // Markdown code blocks ```code```
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-dark text-light p-2 rounded small overflow-auto"><code>$1</code></pre>')
            // Inline code `code`
            .replace(/`([^`]+)`/g, '<code class="bg-light text-danger px-1 py-0.5 rounded small">$1</code>')
            // Convert markdown links [Text](URL) to <a> tags
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_self" class="fw-semibold text-warning text-decoration-underline">$1</a>')
            // Bold text **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italic text *text* or _text_
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Headers ### Header
            .replace(/^### (.*$)/gim, '<h6 class="fw-bold mt-2 mb-1 text-dark">$1</h6>')
            .replace(/^## (.*$)/gim, '<h5 class="fw-bold mt-2 mb-1 text-dark">$1</h5>')
            // Bullet points - item or * item
            .replace(/^\s*[-*]\s+(.*)$/gim, '• $1<br>')
            // Line breaks
            .replace(/\n/g, '<br>');

        return formatted;
    }

    // Append User Message Bubble
    function appendUserMessage(text) {
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-message user-message d-flex mt-2";
        msgDiv.innerHTML = `
            <div class="message-content">
                <p class="mb-0">${parseMarkdown(text)}</p>
            </div>
        `;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    // Append Bot Message Bubble with Copy Option
    function appendBotMessage(text, sourceModel = "") {
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-message bot-message d-flex gap-2 align-items-start mt-2";
        const msgId = "bot_msg_" + Date.now();
        msgDiv.innerHTML = `
            <div class="bot-avatar">
                <i class="fas fa-robot text-dark"></i>
            </div>
            <div class="message-content position-relative">
                <div id="${msgId}">${parseMarkdown(text)}</div>
                <div class="d-flex justify-content-between align-items-center mt-2 pt-1 border-top border-light-subtle">
                    <span class="text-muted text-micro">${sourceModel ? sourceModel : 'Gemini AI'}</span>
                    <button class="btn btn-sm text-muted p-0 copy-msg-btn" data-target="${msgId}" title="Copy response">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        `;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    // Copy to clipboard handler
    messagesContainer.addEventListener("click", function(e) {
        const copyBtn = e.target.closest(".copy-msg-btn");
        if (copyBtn) {
            const targetId = copyBtn.getAttribute("data-target");
            const el = document.getElementById(targetId);
            if (el) {
                const plainText = el.innerText || el.textContent;
                navigator.clipboard.writeText(plainText).then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check text-success"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                });
            }
        }
    });

    // Show / Hide Typing Indicator
    function showTyping(show) {
        if (show) {
            typingIndicator.classList.remove("d-none");
            typingIndicator.classList.add("d-flex");
            scrollToBottom();
        } else {
            typingIndicator.classList.add("d-none");
            typingIndicator.classList.remove("d-flex");
        }
    }

    // Send Message Handler (POST -> /api/chat/)
    async function sendMessage(textToSend) {
        const text = textToSend || chatInput.value.trim();
        if (!text) {
            chatInput.placeholder = "Please enter a message first!";
            setTimeout(() => { chatInput.placeholder = "Ask Yatra AI anything..."; }, 2500);
            return;
        }

        if (isProcessing) return;

        isProcessing = true;
        chatInput.value = "";
        chatInput.disabled = true;
        chatSendBtn.disabled = true;

        // Hide quick actions on user's first custom message
        if (quickActions) quickActions.style.display = "none";

        // Render user message
        appendUserMessage(text);

        // Show typing indicator
        showTyping(true);

        try {
            const response = await fetch('/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify({
                    message: text,
                    history: conversationHistory
                })
            });

            const data = await response.json();
            showTyping(false);

            if (data.success && data.reply) {
                const sourceBadge = data.source ? `${data.source} (${data.model || ''})` : '';
                appendBotMessage(data.reply, sourceBadge);
                
                // Push to conversation history
                conversationHistory.push({ role: 'user', content: text });
                conversationHistory.push({ role: 'model', content: data.reply });
            } else {
                appendBotMessage(data.reply || "Sorry, I'm unable to connect to Gemini right now. Please try again in a moment.");
            }

        } catch (err) {
            console.error("Chatbot API Connection Error:", err);
            showTyping(false);
            appendBotMessage("Sorry, I'm unable to connect to Gemini right now. Please check your internet connection or API configuration.");
        } finally {
            isProcessing = false;
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // Form Submit Event
    chatForm.addEventListener("submit", function(e) {
        e.preventDefault();
        sendMessage();
    });

    // Quick Action Chips Event Delegation
    if (quickActions) {
        quickActions.addEventListener("click", function(e) {
            const chip = e.target.closest(".quick-chip-btn");
            if (chip) {
                const prompt = chip.getAttribute("data-prompt");
                if (prompt) {
                    sendMessage(prompt);
                }
            }
        });
    }

    // Keyboard Accessibility: Esc closes chat
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && !chatWindow.classList.contains("d-none")) {
            toggleChat();
        }
    });
});
