// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 通用 fetch 封装
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// 类型定义
export interface User {
  userId: number;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  bio: string;
  role: number;
  createTime: string;
}

export interface Article {
  articleId: number;
  title: string;
  summary: string;
  content?: string;
  cover: string;
  userId: number;
  categoryId: number;
  viewCount: number;
  isTop: number;
  status: number;
  createTime: string;
  updateTime: string;
  authorNickname: string;
  authorAvatar: string;
  categoryName: string;
  tagNames: string[];
}

export interface Comment {
  commentId: number;
  articleId: number;
  userId: number;
  parentId: number;
  content: string;
  createTime: string;
  user?: User;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
  sort: number;
}

export interface Tag {
  tagId: number;
  tagName: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface Result<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

// 文章相关 API
export const articleApi = {
  // 获取文章列表
  getList: (params?: {
    page?: number;
    size?: number;
    categoryId?: number;
    tagId?: number;
    keyword?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.size) searchParams.set("size", String(params.size));
    if (params?.categoryId) searchParams.set("categoryId", String(params.categoryId));
    if (params?.tagId) searchParams.set("tagId", String(params.tagId));
    if (params?.keyword) searchParams.set("keyword", params.keyword);
    
    const query = searchParams.toString();
    return request<Result<PageResult<Article>>>(`/articles${query ? `?${query}` : ""}`);
  },

  // 获取文章详情
  getDetail: (articleId: number) => 
    request<Result<Article>>(`/articles/${articleId}`),

  // 创建文章
  create: (data: {
    title: string;
    summary: string;
    content: string;
    cover?: string;
    categoryId: number;
    tagIds: number[];
  }) => request<Result<Article>>("/articles", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  // 更新文章
  update: (articleId: number, data: {
    title?: string;
    summary?: string;
    content?: string;
    cover?: string;
    categoryId?: number;
    tagIds?: number[];
    status?: number;
  }) => request<Result<Article>>(`/articles/${articleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  // 删除文章
  delete: (articleId: number) => 
    request<Result<void>>(`/articles/${articleId}`, { method: "DELETE" }),
};

// 评论相关 API
export const commentApi = {
  // 获取文章评论
  getTopComments: (articleId: number) =>
    request<Comment[]>(`/blog-comments/blog/${articleId}/topCommentList`),

  // 获取评论树
  getCommentTree: (articleId: number) =>
    request<Record<number, Comment[]>>(`/blog-comments/blog/${articleId}/commentTreeList`),

  // 发表评论
  post: (data: {
    content: string;
    userId: number;
    articleId: number;
    parentId?: number;
  }) => request<Result<void>>("/blog-comments/blog/post", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  // 删除评论
  delete: (commentId: number, userId: number) =>
    request<Result<void>>(`/blog-comments/blog/${commentId}/${userId}/delete`, {
      method: "DELETE",
    }),

  // 回复评论
  reply: (commentId: number, userId: number, content: string) =>
    request<Result<void>>(`/blog-comments/blog/${commentId}/${userId}/reply`, {
      method: "POST",
      body: JSON.stringify(content),
    }),
};

// 用户相关 API
export const userApi = {
  // 登录
  login: (username: string, password: string) => {
    const params = new URLSearchParams({ username, password });
    return request<string>(`/auth/login?${params}`, { method: "POST" });
  },

  // 注册
  register: (username: string, email: string, password: string) => {
    const params = new URLSearchParams({ username, email, password });
    return request<User>(`/auth/register?${params}`, { method: "POST" });
  },

  // 获取用户信息
  getProfile: (userId: number) => {
    const params = new URLSearchParams({ userId: String(userId) });
    return request<User>(`/users/profile?${params}`);
  },

  // 更新用户信息
  updateProfile: (userId: number, data: {
    nickname?: string;
    avatar?: string;
    bio?: string;
  }) => {
    const params = new URLSearchParams({ userId: String(userId) });
    if (data.nickname) params.set("nickname", data.nickname);
    if (data.avatar) params.set("avatar", data.avatar);
    if (data.bio) params.set("bio", data.bio);
    return request<boolean>(`/users/profile?${params}`, { method: "PUT" });
  },

  // 获取我的文章
  getMyArticles: (userId: number, status?: string) => {
    const params = new URLSearchParams({ userId: String(userId) });
    if (status) params.set("status", status);
    return request<number[]>(`/users/articles?${params}`);
  },

  // 获取我的评论
  getMyComments: (userId: number) => {
    const params = new URLSearchParams({ userId: String(userId) });
    return request<number[]>(`/users/comments?${params}`);
  },

  // 获取收藏列表
  getFavorites: (userId: number) => {
    const params = new URLSearchParams({ userId: String(userId) });
    return request<number[]>(`/users/favorites?${params}`);
  },

  // 收藏文章
  collectArticle: (userId: number, articleId: number) => {
    const params = new URLSearchParams({ userId: String(userId) });
    return request<boolean>(`/users/favorites/${articleId}?${params}`, { method: "POST" });
  },

  // 取消收藏
  cancelCollect: (userId: number, articleId: number) => {
    const params = new URLSearchParams({ userId: String(userId) });
    return request<boolean>(`/users/favorites/${articleId}?${params}`, { method: "DELETE" });
  },
};
