import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { AuthContext } from '../context/AuthContext';
import socket from '../socket';

const CONVERSATIONS_QUERY = gql`
  query Conversations {
    conversations {
      user {
        id
        firstName
        lastName
        role
      }
      lastMessage {
        content
        createdAt
      }
      unreadCount
    }
  }
`;

const MESSAGES_QUERY = gql`
  query Messages($userId: ID!) {
    messages(userId: $userId) {
      id
      senderId
      receiverId
      content
      isRead
      createdAt
    }
  }
`;

/*
  This query must be added to your backend.

  Important:
  Do not simply return every registered user.
  Return only users the current user is permitted to message.
*/
const MESSAGE_CONTACTS_QUERY = gql`
  query MessageContacts {
    messageContacts {
      id
      firstName
      lastName
      role
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($receiverId: ID!, $content: String!) {
    sendMessage(receiverId: $receiverId, content: $content) {
      id
      content
      senderId
      receiverId
      createdAt
    }
  }
`;

function Messages() {
  const { user } = useContext(AuthContext);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  /*
    A ref prevents the socket from disconnecting and reconnecting every
    time the selected conversation changes.
  */
  const selectedUserIdRef = useRef(null);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const {
    data: convData,
    loading: convLoading,
    error: convError,
    refetch: refetchConversations,
  } = useQuery(CONVERSATIONS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: msgData,
    loading: msgLoading,
    error: msgError,
    refetch: refetchMessages,
  } = useQuery(MESSAGES_QUERY, {
    variables: {
      userId: selectedUserId || '',
    },
    skip: !selectedUserId,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: contactsData,
    loading: contactsLoading,
    error: contactsError,
  } = useQuery(MESSAGE_CONTACTS_QUERY, {
    skip: !showNewChat,
    fetchPolicy: 'network-only',
  });

  const [sendMessage, { loading: sendingMessage }] =
    useMutation(SEND_MESSAGE);

  const conversations = convData?.conversations || [];
  const messages = msgData?.messages || [];
  const contacts = contactsData?.messageContacts || [];

  const selectedConversation = conversations.find(
    (conversation) =>
      String(conversation.user.id) === String(selectedUserId)
  );

  /*
    selectedConversation will be undefined when starting a completely
    new conversation. selectedUser keeps the header populated.
  */
  const activeUser = selectedConversation?.user || selectedUser;

  const filteredContacts = useMemo(() => {
    const search = contactSearch.trim().toLowerCase();

    return contacts.filter((contact) => {
      if (String(contact.id) === String(user?.id)) {
        return false;
      }

      if (!search) {
        return true;
      }

      const fullName =
        `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();

      return (
        fullName.includes(search) ||
        contact.role?.toLowerCase().includes(search)
      );
    });
  }, [contacts, contactSearch, user?.id]);

  const getInitials = (person) => {
    const firstInitial = person?.firstName?.[0] || '';
    const lastInitial = person?.lastName?.[0] || '';

    return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
  };

  const formatMessageTime = (createdAt) => {
    if (!createdAt) return '';

    const numericTimestamp = Number(createdAt);

    const date = Number.isNaN(numericTimestamp)
      ? new Date(createdAt)
      : new Date(numericTimestamp);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openConversation = (conversationUser) => {
    setSelectedUserId(conversationUser.id);
    setSelectedUser(conversationUser);
    setShowNewChat(false);
    setContactSearch('');
  };

  const handleSend = async (event) => {
    event.preventDefault();

    const content = messageInput.trim();

    if (!content || !selectedUserId || sendingMessage) {
      return;
    }

    try {
      await sendMessage({
        variables: {
          receiverId: selectedUserId,
          content,
        },
      });

      setMessageInput('');

      await Promise.all([
        refetchMessages(),
        refetchConversations(),
      ]);
    } catch (error) {
      console.error('Message sending failed:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('directlet_token');

    if (!token || !user?.id) {
      return undefined;
    }

    socket.auth = {
      token,
      userId: user.id,
    };

    socket.connect();
    socket.emit('join', {
      userId: user.id,
    });

    const handleNewMessage = async (message) => {
      const activeUserId = selectedUserIdRef.current;

      const belongsToOpenConversation =
        activeUserId &&
        (
          String(message.senderId) === String(activeUserId) ||
          String(message.receiverId) === String(activeUserId)
        );

      if (belongsToOpenConversation) {
        await refetchMessages();
      }

      await refetchConversations();
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.disconnect();
    };
  }, [
    user?.id,
    refetchMessages,
    refetchConversations,
  ]);

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Messages</h1>

        <p className="text-muted">
          Communicate directly with landlords and tenants
        </p>
      </div>

      <div className="messaging-container">
        <div className="conversations-list">
          <div className="conv-header">
            <h3>Conversations</h3>

            <button
              type="button"
              className="new-message-button"
              onClick={() => setShowNewChat((current) => !current)}
            >
              {showNewChat ? 'Close' : '+ New message'}
            </button>
          </div>

          {showNewChat && (
            <div className="new-chat-panel">
              <input
                type="search"
                className="contact-search"
                placeholder="Search landlords or tenants..."
                value={contactSearch}
                onChange={(event) =>
                  setContactSearch(event.target.value)
                }
                autoFocus
              />

              <div className="contact-results">
                {contactsLoading ? (
                  <p className="contact-status">
                    Loading contacts...
                  </p>
                ) : contactsError ? (
                  <p className="contact-error">
                    Could not load available contacts.
                  </p>
                ) : filteredContacts.length === 0 ? (
                  <p className="contact-status">
                    No available contacts found.
                  </p>
                ) : (
                  filteredContacts.map((contact) => (
                    <button
                      type="button"
                      className="contact-item"
                      key={contact.id}
                      onClick={() => openConversation(contact)}
                    >
                      <span className="conv-avatar">
                        {getInitials(contact)}
                      </span>

                      <span className="contact-details">
                        <strong>
                          {contact.firstName} {contact.lastName}
                        </strong>

                        <small>
                          {contact.role || 'User'}
                        </small>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {convLoading ? (
            <div className="conv-loading">
              Loading conversations...
            </div>
          ) : convError ? (
            <div className="conv-empty">
              <p>Could not load conversations.</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="conv-empty">
              <p>No conversations yet</p>

              <small>
                Start a conversation with a landlord or tenant.
              </small>

              <button
                type="button"
                className="empty-start-button"
                onClick={() => setShowNewChat(true)}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.user.id}
                className={`conv-item ${
                  String(selectedUserId) ===
                  String(conversation.user.id)
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  openConversation(conversation.user)
                }
              >
                <div className="conv-avatar">
                  {getInitials(conversation.user)}
                </div>

                <div className="conv-details">
                  <p className="conv-name">
                    {conversation.user.firstName}{' '}
                    {conversation.user.lastName}
                  </p>

                  <p className="conv-preview">
                    {conversation.lastMessage?.content?.slice(
                      0,
                      40
                    ) || 'No messages'}
                  </p>
                </div>

                {conversation.unreadCount > 0 && (
                  <span className="conv-badge">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="messaging-window">
          {!selectedUserId || !activeUser ? (
            <div className="chat-placeholder">
              <h3>Select or start a conversation</h3>

              <p>
                Choose an existing conversation or create a new one.
              </p>

              <button
                type="button"
                className="placeholder-start-button"
                onClick={() => setShowNewChat(true)}
              >
                New message
              </button>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-header-avatar">
                  {getInitials(activeUser)}
                </div>

                <div>
                  <p className="chat-header-name">
                    {activeUser.firstName}{' '}
                    {activeUser.lastName}
                  </p>

                  <span className="chat-header-role">
                    {activeUser.role}
                  </span>
                </div>
              </div>

              <div className="messages">
                {msgLoading ? (
                  <p className="text-center text-muted">
                    Loading messages...
                  </p>
                ) : msgError ? (
                  <p className="text-center message-error">
                    Could not load messages.
                  </p>
                ) : messages.length === 0 ? (
                  <div className="first-message-placeholder">
                    <p>
                      You have not messaged{' '}
                      {activeUser.firstName} yet.
                    </p>

                    <small>
                      Write the first message below.
                    </small>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isSentByCurrentUser =
                      String(message.senderId) ===
                      String(user?.id);

                    return (
                      <div
                        key={message.id}
                        className={`message ${
                          isSentByCurrentUser
                            ? 'sent'
                            : 'received'
                        }`}
                      >
                        <p>{message.content}</p>

                        <span className="message-time">
                          {formatMessageTime(
                            message.createdAt
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="chat-input"
              >
                <input
                  type="text"
                  placeholder={`Message ${activeUser.firstName}...`}
                  value={messageInput}
                  onChange={(event) =>
                    setMessageInput(event.target.value)
                  }
                  maxLength={2000}
                />

                <button
                  type="submit"
                  disabled={
                    !messageInput.trim() || sendingMessage
                  }
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
