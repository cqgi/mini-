// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 获取存储的 token
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// 通用 fetch 封装
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  // 尝试解析 JSON，如果失败则返回文本
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text() as unknown as T;
}

// 类型定义 - 与后端 VO/DTO 完全对应
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

export interface ArticleTag {
  tagId: number;
  tagName: string;
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
  tags?: ArticleTag[];
}

export interface Comment {
  commentId: number;
  articleId: number;
  userId: number;
  parentId: number | null;
  content: string;
  createTime: string;
  nickname?: string;
  avatar?: string;
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

// 后端 Result 响应格式
export interface Result<T = unknown> {
  code: number;
  success: boolean;
  message: string;
  errorMsg: string | null;
  data: T;
  total: number | null;
}

// 文章相关 API
export const articleApi = {
  // 获取文章列表（前台）
  getList: (params?: {
    current?: number;
    size?: number;
    categoryId?: number;
    keyword?: string;
    isTop?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.current) searchParams.set("current", String(params.current));
    if (params?.size) searchParams.set("size", String(params.size));
    if (params?.categoryId) searchParams.set("categoryId", String(params.categoryId));
    if (params?.keyword) searchParams.set("keyword", params.keyword);
    if (params?.isTop !== undefined) searchParams.set("isTop", String(params.isTop));
    
    const query = searchParams.toString();
    return request<Result<Article[]>>(`/articles${query ? `?${query}` : ""}`);
  },

  // 获取文章详情（前台）
  getDetail: (articleId: number) => 
    request<Result<Article>>(`/articles/${articleId}`),

  // 创建文章
  create: (data: {
    title: string;
    summary: string;
    content: string;
    cover?: string;
    userId: number;
    categoryId: number;
    status: number;
    tagIds?: number[];
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
    status?: number;
    tagIds?: number[];
  }) => request<Result<Article>>(`/articles/${articleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  // 删除文章
  delete: (articleId: number) => 
    request<Result<void>>(`/articles/${articleId}`, { method: "DELETE" }),

  // 切换置顶状态
  toggleTop: (articleId: number, isTop: number) =>
    request<Result<void>>(`/articles/${articleId}/top?isTop=${isTop}`, { method: "PATCH" }),

  // 获取管理员文章列表
  getAdminList: (params?: {
    current?: number;
    size?: number;
    categoryId?: number;
    keyword?: string;
    status?: number;
    isTop?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.current) searchParams.set("current", String(params.current));
    if (params?.size) searchParams.set("size", String(params.size));
    if (params?.categoryId) searchParams.set("categoryId", String(params.categoryId));
    if (params?.keyword) searchParams.set("keyword", params.keyword);
    if (params?.status !== undefined) searchParams.set("status", String(params.status));
    if (params?.isTop !== undefined) searchParams.set("isTop", String(params.isTop));
    
    const query = searchParams.toString();
    return request<Result<Article[]>>(`/admin/articles${query ? `?${query}` : ""}`);
  },

  // 获取管理员文章详情
  getAdminDetail: (articleId: number) =>
    request<Result<Article>>(`/admin/articles/${articleId}`),
};

// 评论相关 API
export const commentApi = {
  // 获取文章一级评论
  getTopComments: (articleId: number) =>
    request<Comment[]>(`/blog-comments/blog/${articleId}/topCommentList`),

  // 获取评论树（一级+子回复）
  getCommentTree: (articleId: number) =>
    request<Record<number, Comment[]>>(`/blog-comments/blog/${articleId}/commentTreeList`),

  // 发表评论
  post: (data: {
    content: string;
    userId: number;
    articleId: number;
    parentId?: number | null;
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
  // 登录 - 返回 token 字符串
  login: async (username: string, password: string): Promise<string> => {
    const params = new URLSearchParams({ username, password });
    const response = await request<string>(`/auth/login?${params}`, { method: "POST" });
    // 存储 token
    if (response && typeof window !== "undefined") {
      localStorage.setItem("token", response);
    }
    return response;
  },

  // 管理员登录
  adminLogin: async (username: string, password: string): Promise<string> => {
    const params = new URLSearchParams({ username, password });
    const response = await request<string>(`/auth/admin/login?${params}`, { method: "POST" });
    if (response && typeof window !== "undefined") {
      localStorage.setItem("token", response);
    }
    return response;
  },

  // 注册 - 返回 User 对象
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

  // 获取我的文章（返回文章 ID 列表）
  getMyArticles: (userId: number, status?: string) => {
    const params = new URLSearchParams({ userId: String(userId) });
    if (status) params.set("status", status);
    return request<number[]>(`/users/articles?${params}`);
  },

  // 获取我的评论（返回评论 ID 列表）
  getMyComments: (userId: number) => {
    const params = new URLSearchParams({ userId: String(userId) });
    return request<number[]>(`/users/comments?${params}`);
  },

  // 获取收藏列表（返回文章 ID 列表）
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

  // 退出登录
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};

// 工具函数：解析 JWT Token 获取用户 ID
export function parseToken(token: string): { userId: number; exp: number } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

// 检查 token 是否过期
export function isTokenExpired(token: string): boolean {
  const decoded = parseToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}
