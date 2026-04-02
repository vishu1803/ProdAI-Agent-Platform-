"use client";

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

export default function Home() {
  // @ts-ignore
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [telemetry, setTelemetry] = useState({ inputTokens: 0, outputTokens: 0 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [maxCost, setMaxCost] = useState(5.00);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vertically as new tokens/tools emerge
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for telemetry stats
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/telemetry");
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch (e) {
        // ignore dev polling errors
      }
    };
    
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="layout-wrapper">
      <style jsx>{`
        .layout-wrapper {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
        
        .sidebar {
          width: 300px;
          background: rgba(255, 255, 255, 0.02);
          border-right: 1px solid var(--card-border);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .main-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .chat-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--card-border);
          backdrop-filter: blur(12px);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
        }

        .messages-area {
          flex: 1;
          padding: 6rem 2rem 8rem 2rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .message-bubble {
          max-width: 80%;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-md);
          line-height: 1.6;
          animation: fadeIn 0.3s ease-out;
          white-space: pre-wrap;
        }

        .message-user {
          background: var(--primary);
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .message-agent {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }

        .tool-invocation {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: #a7f3d0;
          background: #064e3b;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin: 1rem 0;
          border: 1px solid #047857;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .tool-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .tool-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }
        
        .status-partial-call { background: #f59e0b; animation: pulse-anim 1s infinite; }
        .status-call { background: #3b82f6; }
        .status-result { background: #10b981; }

        .tool-args {
          color: #d1fae5;
          opacity: 0.8;
          white-space: pre-wrap;
          word-break: break-all;
        }

        /* Markdown Overrides */
        .markdown-wrapper p { margin-bottom: 1rem; }
        .markdown-wrapper pre { background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 4px; overflow-x: auto; margin-bottom: 1rem; }
        .markdown-wrapper code { font-family: var(--font-mono); background: rgba(0,0,0,0.2); padding: 0.2rem 0.4rem; border-radius: 3px; }
        .markdown-wrapper ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .markdown-wrapper ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
        
        .settings-btn {
          margin-top: auto;
          background: transparent;
          border: 1px solid var(--card-border);
          color: var(--foreground);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .settings-btn:hover { background: rgba(255,255,255,0.05); }

        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
        }
        .modal-content {
          background: var(--background);
          border: 1px solid var(--card-border);
          padding: 2rem;
          border-radius: var(--radius-lg);
          width: 400px;
          max-width: 90vw;
        }
        .modal-close {
          float: right; cursor: pointer; border: none; background: none; color: #888; font-size: 1.5rem;
        }

        .input-area {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2rem;
          background: linear-gradient(transparent, var(--background) 20%);
        }

        .input-form {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .chat-input {
          width: 100%;
          padding: 1rem 4rem 1rem 1.5rem;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          color: var(--foreground);
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .chat-input:focus {
          border-color: var(--primary);
        }

        .send-button {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: var(--primary);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .send-button:disabled {
          background: var(--card-border);
          cursor: not-allowed;
        }

        .send-button:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--success);
        }

        .pulse {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--success);
          animation: pulse-anim 2s infinite;
        }

        h2 {
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #888;
          margin-bottom: 1rem;
        }
        
        .stat-box {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          padding: 1rem;
          border-radius: var(--radius-sm);
          margin-bottom: 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.875rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-anim {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      {/* Sidebar for telemetry and diagnostic info */}
      <aside className="sidebar">
        <div>
          <h2>System Status</h2>
          <div className="status-indicator">
            <div className="pulse"></div>
            Core Loop Active
          </div>
        </div>

        <div>
          <h2>Active Tools</h2>
          <div className="stat-box">0/184 Registered</div>
          <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.5rem" }}>
            Registry will be populated in Phase 3.
          </p>
        </div>

        <div>
          <h2>Telemetry</h2>
          <div className="stat-box">Input Tokens: {telemetry.inputTokens.toLocaleString()}</div>
          <div className="stat-box">Output Tokens: {telemetry.outputTokens.toLocaleString()}</div>
          <div className="stat-box">Turn Count: {Math.max(0, messages.length)} / 15</div>
        </div>
        
        <button className="settings-btn" onClick={() => setIsSettingsOpen(true)}>
          ⚙️ Settings & Thresholds
        </button>
      </aside>

      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsSettingsOpen(false)}>×</button>
            <h2 style={{ color: 'var(--foreground)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Agent Settings</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Max Cost Threshold Per Task ($)</label>
              <input 
                type="number" 
                value={maxCost} 
                onChange={e => setMaxCost(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
                step="0.5"
                min="0.5"
              />
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Agent will pause execution if telemetry detects spending exceeds this limit (Feature coming soon via HookEngine).</p>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa' }}>
              <input type="checkbox" defaultChecked />
              Auto-approve safe File/Bash tools
            </label>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="main-chat">
        <header className="chat-header">
          <h1 style={{ fontSize: "1.25rem", fontWeight: 500 }}>AI Agent Workspace</h1>
        </header>

        <div className="messages-area">
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#666", marginTop: "4rem" }}>
              Ready. What operation would you like to perform on this workspace?
            </div>
          )}
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`message-bubble message-${msg.role}`}
            >
              {msg.role === "agent" ? (
                <div className="markdown-wrapper">
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
              
              {msg.toolInvocations?.map((toolInvocation: any, index: number) => (
                <div key={index} className="tool-invocation">
                  <div className="tool-header">
                    <span className={`tool-status status-${toolInvocation.state}`}></span>
                    {toolInvocation.toolName} ({toolInvocation.state})
                  </div>
                  <div className="tool-args">
                    {JSON.stringify(toolInvocation.args)}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <form className="input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input"
              placeholder="Send a prompt to the Core Loop..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button type="submit" className="send-button" disabled={isLoading || !input?.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
