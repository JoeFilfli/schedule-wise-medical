'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PatientChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '👋 Hello! I can help you find doctors, book appointments, or answer questions.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input === '' && !loading) {
      inputRef.current?.focus();
    }
  }, [input, loading]);

  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: updatedMessages }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="container-fluid px-4 py-4"
      style={{
        height: '93vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f5f5f5',
      }}
    >
      <h2 className="mb-3 text-center">💬 Chat with Assistant</h2>

      <div
        ref={scrollContainerRef}
        className="border rounded bg-light p-3 mb-3"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}
          >
            <div
              className={`d-inline-block px-3 py-2 rounded ${
                msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'
              }`}
              style={{ maxWidth: '100%' }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }) => (
                    <table className="table table-bordered table-sm mb-2">
                      {children}
                    </table>
                  ),
                  th: ({ children }) => (
                    <th className="bg-light text-center">{children}</th>
                  ),
                  td: ({ children }) => <td className="text-center">{children}</td>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
