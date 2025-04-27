export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface Post {
  id: string
  title: string
  description: string
  imageUrl: string
  author: string
  likes?: number
  commentCount?: number
  comments?: Comment[]
  liked?: boolean
  groupId?: string
  article?: Article
  createdAt?: string
}

export interface Article {
  id: string
  postId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  username: string
  text: string
  createdAt: string
}

export interface Group {
  id: string
  name: string
  description: string
  createdBy: string
  members?: number
  joined?: boolean
  messages?: GroupMessage[]
  posts?: Post[]
  members?: User[]
}

export interface GroupMessage {
  id: string
  username: string
  text: string
  createdAt: string
}

export interface Notification {
  id: string
  recipient: string
  message: string
  read: boolean
  createdAt: string
}

export interface User {
  id: string
  username: string
  email: string
}

export interface CreatePostData {
  title: string
  description: string
  imageUrl: string
  author: string
  groupId?: string
  article?: {
    content: string
  }
}

export interface UpdatePostData {
  title: string
  description: string
  imageUrl: string
  article?: {
    content: string
  }
}

export interface CreateGroupData {
  name: string
  description: string
  createdBy: string
}
