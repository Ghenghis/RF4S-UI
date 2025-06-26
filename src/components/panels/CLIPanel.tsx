
import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Bot, User } from 'lucide-react';
import { useRF4SStore } from '../../stores/rf4sStore';

interface CLIMessage {
  id: string;
  type: 'command' | 'output' | 'error' | 'info' | 'ai' | 'user';
  content: string;
  timestamp: Date;
}

const CLIPanel: React.FC = () => {
  const [messages, setMessages] = useState<CLIMessage[]>([
    {
      id: '1',
      type: 'info',
      content: 'RF4S CLI v4.0 - Interactive Command Interface',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'info',
      content: 'Type "help" for available commands or chat with AI for assistance',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { config, updateConfig } = useRF4SStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCommand = (command: string) => {
    const newMessage: CLIMessage = {
      id: Date.now().toString(),
      type: isAIMode ? 'user' : 'command',
      content: command,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    if (isAIMode) {
      // AI chat mode
      handleAIResponse(command);
    } else {
      // CLI command mode
      executeCommand(command.toLowerCase().trim());
    }
  };

  const handleAIResponse = (userMessage: string) => {
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: CLIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I understand you want to ${userMessage}. Let me help you with that. I can adjust settings, start/stop the bot, or explain any feature.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const executeCommand = (command: string) => {
    let output = '';
    
    switch (command.split(' ')[0]) {
      case 'help':
        output = `Available commands:
- start: Start fishing bot
- stop: Stop fishing bot
- status: Show current status
- profiles: List fishing profiles
- set <setting> <value>: Change settings
- ai: Switch to AI chat mode
- clear: Clear terminal
- config: Show current configuration`;
        break;
      
      case 'start':
        updateConfig('script', { enabled: true });
        output = 'Fishing bot started successfully';
        break;
      
      case 'stop':
        updateConfig('script', { enabled: false });
        output = 'Fishing bot stopped';
        break;
      
      case 'status':
        output = `Bot Status: ${config.script.enabled ? 'Running' : 'Stopped'}
Mode: ${config.script.mode}
Active Profile: ${config.profiles.active}
Sensitivity: ${config.script.sensitivity}`;
        break;
      
      case 'profiles':
        output = Object.entries(config.profiles.profiles)
          .map(([id, profile]) => `${id}: ${profile.name} (${profile.technique}) - ${profile.enabled ? 'Enabled' : 'Disabled'}`)
          .join('\n');
        break;
      
      case 'ai':
        setIsAIMode(true);
        output = 'Switched to AI chat mode. Type your questions or requests naturally.';
        break;
      
      case 'cli':
        setIsAIMode(false);
        output = 'Switched to CLI command mode. Type "help" for commands.';
        break;
      
      case 'clear':
        setMessages([]);
        return;
      
      case 'config':
        output = JSON.stringify(config, null, 2);
        break;
      
      default:
        output = `Unknown command: ${command}. Type "help" for available commands.`;
    }

    const outputMessage: CLIMessage = {
      id: (Date.now() + 1).toString(),
      type: output.includes('Unknown') ? 'error' : 'output',
      content: output,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, outputMessage]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      handleCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-xs">
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-green-500">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4" />
          <span className="text-white">RF4S Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAIMode(!isAIMode)}
            className={`px-2 py-1 rounded text-xs ${
              isAIMode ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            {isAIMode ? <><Bot className="h-3 w-3 inline mr-1" />AI</> : 'CLI'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-start space-x-2">
              {message.type === 'ai' && <Bot className="h-3 w-3 mt-0.5 text-blue-400" />}
              {message.type === 'user' && <User className="h-3 w-3 mt-0.5 text-yellow-400" />}
              <div className={`flex-1 ${
                message.type === 'error' ? 'text-red-400' :
                message.type === 'info' ? 'text-blue-400' :
                message.type === 'ai' ? 'text-blue-300' :
                message.type === 'user' ? 'text-yellow-300' :
                'text-green-400'
              }`}>
                <pre className="whitespace-pre-wrap break-words">{message.content}</pre>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center p-2 border-t border-green-500">
        <span className="text-green-500 mr-2">
          {isAIMode ? '🤖' : '$'}
        </span>
        <input
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          className="flex-1 bg-transparent text-green-400 outline-none"
          placeholder={isAIMode ? "Ask me anything about RF4S..." : "Enter command..."}
        />
        <button type="submit" className="ml-2 text-green-500 hover:text-green-300">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default CLIPanel;
