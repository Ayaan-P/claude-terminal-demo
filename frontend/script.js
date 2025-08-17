class ClaudeTerminal {
    constructor() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('commandInput');
        this.status = document.getElementById('status');
        this.connectionStatus = document.getElementById('connection-status');
        
        this.backendUrl = this.getBackendUrl();
        this.ws = null;
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.init();
    }
    
    getBackendUrl() {
        // Check if we're running on Netlify or localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        } else {
            // When deployed on Netlify, connect to your laptop
            return 'http://172.31.187.0:3001';
        }
    }
    
    init() {
        this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.connectWebSocket();
        this.updateStatus('Ready');
    }
    
    handleKeyDown(event) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                this.executeCommand();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigateHistory(-1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.navigateHistory(1);
                break;
        }
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = -1;
            this.input.value = '';
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length - 1;
        }
        
        if (this.historyIndex >= 0) {
            this.input.value = this.commandHistory[this.historyIndex];
        }
    }
    
    executeCommand() {
        const command = this.input.value.trim();
        if (!command) return;
        
        // Add to history
        this.commandHistory.push(command);
        this.historyIndex = -1;
        
        // Display command in terminal
        this.addOutput('command', command);
        
        // Clear input
        this.input.value = '';
        
        // Send command to backend
        this.sendCommand(command);
    }
    
    async sendCommand(command) {
        try {
            this.updateStatus('Processing...');
            
            const response = await fetch(`${this.backendUrl}/api/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.addOutput('response', result.output);
            } else {
                this.addOutput('error', result.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            this.addOutput('error', `Connection error: ${error.message}`);
        } finally {
            this.updateStatus('Ready');
        }
    }
    
    connectWebSocket() {
        try {
            this.ws = new WebSocket(`ws://${new URL(this.backendUrl).host}`);
            
            this.ws.onopen = () => {
                this.updateConnectionStatus('connected');
                console.log('WebSocket connected');
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };
            
            this.ws.onclose = () => {
                this.updateConnectionStatus('disconnected');
                console.log('WebSocket disconnected');
                // Attempt to reconnect after 3 seconds
                setTimeout(() => this.connectWebSocket(), 3000);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('disconnected');
            };
            
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            this.updateConnectionStatus('disconnected');
        }
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'status':
                this.updateStatus(data.message);
                break;
            case 'output':
                this.addOutput('response', data.message);
                break;
            case 'error':
                this.addOutput('error', data.message);
                break;
        }
    }
    
    addOutput(type, content) {
        const outputDiv = document.createElement('div');
        outputDiv.className = 'output-line';
        
        switch (type) {
            case 'command':
                outputDiv.innerHTML = `
                    <div class="command-line">
                        <span class="prompt">claude@terminal:~$</span>
                        <span class="command">${this.escapeHtml(content)}</span>
                    </div>
                `;
                break;
            case 'response':
                outputDiv.innerHTML = `<div class="response-line">${this.escapeHtml(content)}</div>`;
                break;
            case 'error':
                outputDiv.innerHTML = `<div class="error-line">Error: ${this.escapeHtml(content)}</div>`;
                break;
            case 'status':
                outputDiv.innerHTML = `<div class="status-line">${this.escapeHtml(content)}</div>`;
                break;
        }
        
        this.output.appendChild(outputDiv);
        this.scrollToBottom();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    updateStatus(message) {
        this.status.textContent = message;
    }
    
    updateConnectionStatus(status) {
        this.connectionStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        this.connectionStatus.className = status;
    }
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ClaudeTerminal();
});