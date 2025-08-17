#!/usr/bin/env python3
import subprocess
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import threading

class ClaudeHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/':
            with open('/home/rot/Projects/claude-terminal-demo/frontend/index.html', 'r') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(content.encode())
        elif self.path.endswith('.css'):
            with open(f'/home/rot/Projects/claude-terminal-demo/frontend{self.path}', 'r') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/css')
            self.end_headers()
            self.wfile.write(content.encode())
        elif self.path.endswith('.js'):
            with open(f'/home/rot/Projects/claude-terminal-demo/frontend{self.path}', 'r') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.end_headers()
            self.wfile.write(content.encode())
    
    def do_POST(self):
        if self.path == '/api/execute':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                command = data.get('command', '')
                
                print(f"Executing Claude command: {command}")
                
                # Execute Claude Code with proper environment
                env = os.environ.copy()
                env.update({
                    'CLAUDE_DANGEROUS_MODE': 'true',
                    'CLAUDE_CODE_BYPASS_PERMISSIONS': '1',
                    'NO_COLOR': '1',
                    'TERM': 'xterm-256color'
                })
                
                # Use the Node.js bypass that actually executes denied tools
                result = subprocess.run([
                    '/home/rot/Projects/claude-terminal-demo/claude-bypass.js',
                    command
                ], 
                capture_output=True, 
                text=True, 
                env=env,
                cwd='/home/rot/Projects/claude-terminal-demo',
                timeout=300
                )
                
                if result.returncode == 0:
                    try:
                        claude_output = json.loads(result.stdout)
                        response = {
                            "success": True,
                            "output": claude_output.get('result', result.stdout)
                        }
                    except json.JSONDecodeError:
                        response = {
                            "success": True,
                            "output": result.stdout
                        }
                else:
                    response = {
                        "success": False,
                        "error": result.stderr or f"Command failed with code {result.returncode}"
                    }
                
            except Exception as e:
                response = {
                    "success": False,
                    "error": str(e)
                }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 3001), ClaudeHandler)
    print("🚀 Python Claude Terminal Server running on port 3001")
    print("📁 Serving frontend from: /home/rot/Projects/claude-terminal-demo/frontend")
    print("🌐 Open http://localhost:3001 in your browser")
    server.serve_forever()