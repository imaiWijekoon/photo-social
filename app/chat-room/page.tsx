'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getUsername } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Types
interface Message {
  id: string;
  username: string;
  text: string;
  createdAt: string;
}

const BASE_URL = 'http://localhost:8080/api'; // Change if needed

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUsername = getUsername();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [updatedText, setUpdatedText] = useState('');

  // Fetch messages every 3 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages(); // Initial load

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval); // Cleanup
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${BASE_URL}/messages`, null, {
        params: { username: currentUsername, text: newMessage.trim() },
      });
      setNewMessage(''); // Clear input
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setUpdatedText(message.text);
    }
  };

  const handleUpdateMessage = async (messageId: string) => {
    try {
      await axios.put(`${BASE_URL}/messages/${messageId}`, null, {
        params: { updatedText },
      });
      setEditingMessageId(null); // Exit edit mode
      setUpdatedText(''); // Clear input
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`${BASE_URL}/messages/${messageId}`);
      setMessages(messages.filter((msg) => msg.id !== messageId)); // Remove deleted message locally
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Forum Chat</h1>

      {/* Messages List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-4">
            {/* User Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`/placeholder.svg?text=${message.username.charAt(0)}`}
                alt={message.username}
              />
              <AvatarFallback>{message.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div className="flex-1">
              <div className="font-medium">{message.username}</div>
              <div className="text-sm">
                {editingMessageId === message.id ? (
                  <form onSubmit={(e) => e.preventDefault()}>
                    <Input
                      value={updatedText}
                      onChange={(e) => setUpdatedText(e.target.value)}
                      placeholder="Edit your message..."
                      className="flex-1"
                    />
                    <Button type="submit" onClick={() => handleUpdateMessage(message.id)}>
                      Save
                    </Button>
                  </form>
                ) : (
                  message.text
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Edit and Delete Buttons */}
            {currentUsername === message.username && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditMessage(message.id)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-sm text-destructive hover:text-destructive/90"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2 absolute top-[75vh] left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}