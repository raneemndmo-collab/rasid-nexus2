export enum ThreadType { DIRECT = 'direct', GROUP = 'group', CHANNEL = 'channel' }
export enum ContentType { TEXT = 'text', HTML = 'html', MARKDOWN = 'markdown', FILE = 'file' }

export interface MessageThread {
  id: string;
  tenantId: string;
  subject?: string;
  type: ThreadType;
  participants: { userId: string; role?: string }[];
  lastMessageAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  tenantId: string;
  threadId: string;
  senderId: string;
  content: string;
  contentType: ContentType;
  attachments: { fileId: string; fileName: string; mimeType: string }[];
  readBy: { userId: string; readAt: string }[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
