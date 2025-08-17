# Claude Code Terminal Demo

A proof-of-concept web-based terminal interface that allows users to send natural language commands to Claude Code via a backend microservice.

## Features

- **Terminal-style Web Interface**: Clean, terminal-inspired UI with command history
- **Natural Language Commands**: Send commands in plain English to Claude Code
- **Real-time Communication**: WebSocket support for live command processing
- **Command History**: Navigate through previous commands with arrow keys
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

```
Frontend (HTML/CSS/JS) ↔ Backend (Python HTTP Server) ↔ Claude Bypass Script ↔ Claude Code CLI
```

- **Frontend**: Terminal-style interface built with vanilla HTML, CSS, and JavaScript
- **Backend**: Python HTTP server that handles API requests and executes Claude Code via bypass script
- **Claude Code**: Official Anthropic CLI that processes natural language commands

## Setup & Installation

### Prerequisites

- Python 3.6+
- Claude Code CLI installed and authenticated
- Valid Claude subscription/API access

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd claude-terminal-demo
   ```

2. **Ensure Claude Code is working:**
   ```bash
   claude --print "Hello world"
   ```

3. **Start the Python backend server:**
   ```bash
   python3 python-server.py
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3001
   ```

## Usage

### Example Commands

Try these natural language commands in the terminal interface:

- `"What is 2 + 2?"`
- `"Explain how JavaScript promises work"`
- `"What is the capital of France?"`
- `"Help me debug this Python function"`
- `"Create a simple HTML page"`

### API Endpoints

- `GET /` - Serves the terminal interface
- `GET /api/health` - Health check endpoint
- `GET /api/info` - System information
- `POST /api/execute` - Execute a command via Claude Code

### Example API Usage

```bash
curl -X POST http://localhost:3001/api/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "What is the capital of France?"}'
```

Response:
```json
{
  "success": true,
  "output": "Paris",
  "executionTime": 1250
}
```

## Configuration

The backend server can be configured via environment variables:

- `CLAUDE_DANGEROUS_MODE` - Enables dangerous operations (set to 'true')
- `CLAUDE_CODE_BYPASS_PERMISSIONS` - Bypasses permission prompts (set to '1')
- `NO_COLOR` - Disables colored output (set to '1')

## Technical Details

### Backend Implementation

- **Python HTTP server** with CORS support
- **Subprocess execution** for Claude Code CLI via bypass script
- **Permission bypass** using `claude-bypass.js` to auto-execute denied tools
- **JSON output parsing** from Claude Code responses
- **Error handling** for process failures and timeouts

### Frontend Implementation

- **Vanilla JavaScript** - No frameworks required
- **Terminal emulation** with command history and keyboard navigation
- **WebSocket client** for real-time communication
- **Responsive CSS** with terminal aesthetics

### Security Considerations

- Input validation on all API endpoints
- Process timeout limits (30 seconds)
- CORS configuration for web access
- Claude Code permission system integration

## Troubleshooting

### Common Issues

1. **Claude Code Authentication**
   ```bash
   claude doctor  # Check authentication status
   ```

2. **Permission Errors**
   - Ensure Claude Code is properly authenticated
   - Check if running with appropriate user permissions

3. **Connection Issues**
   - Verify backend is running on port 3001
   - Check firewall settings
   - Ensure WebSocket connections are allowed

### Debug Mode

Enable verbose logging:
```bash
DEBUG=* npm start
```

## Future Enhancements

- [ ] Session management for conversation continuity
- [ ] File upload support for code analysis
- [ ] Command completion and suggestions
- [ ] Multiple Claude model selection
- [ ] User authentication and rate limiting
- [ ] Command output formatting (markdown, syntax highlighting)
- [ ] Export conversation history

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This is a proof-of-concept demonstration. For production use, additional security measures, error handling, and scalability considerations should be implemented.