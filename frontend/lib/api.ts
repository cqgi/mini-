const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type BackendResult<T = unknown> = {
  code?: number;
  success?: boolean;
  message?: string;
  errorMsg?: string | null;
  data?: T;
  total?: number | null;
  suggestion?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBackendResult<T>(value: unknown): value is BackendResult<T> {
  return (
    isRecord(value) &&
    ("success" in value || "errorMsg" in value || "message" in value || "code" in value)
  );
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (isRecord(payload)) {
    const message = payload.message;
    const errorMsg = payload.errorMsg;
    const error = payload.error;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
    if (typeof errorMsg === "string" && errorMsg.trim()) {
      return errorMsg;
    }
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return fallback;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // ====================== 这里自动加 token ======================
  const headers = new Headers(options.headers || {});

  // 客户端才存在 localStorage，服务端不执行
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  // ===============================================================

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers, // 用带了 token 的 headers
    });
  } catch {
    throw new Error("无法连接服务，请确认前端代理和后端服务已启动");
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload, `请求失败（${response.status}）`)
    );
  }

  return payload as T;
}

function unwrapResult<T>(payload: unknown) {
  if (isBackendResult<T>(payload)) {
    const failed =
      payload.success === false ||
      (typeof payload.code === "number" && payload.code >= 400);

    if (failed) {
      throw new Error(extractErrorMessage(payload, "请求失败"));
    }

    return {
      data: (payload.data ?? null) as T,
      total: typeof payload.total === "number" ? payload.total : null,
      message: typeof payload.message === "string" ? payload.message : "",
      suggestion:
        typeof payload.suggestion === "string" && payload.suggestion.trim()
          ? payload.suggestion.trim()
          : null,
    };
  }

  return {
    data: payload as T,
    total: null,
    message: "",
    suggestion: null,
  };
}

export interface User {
  userId: number;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  bio: string;
  role: number;
  createTime: string;
  updateTime?: string;
}

export interface AdminUser {
  userId: number;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  bio: string;
  role: number;
  createTime: string;
  updateTime?: string;
}

export interface Article {
  articleId: number;
  title: string;
  summary: string;
  content?: string;
  cover: string | null;
  userId: number;
  categoryId: number;
  viewCount: number;
  isTop: number;
  status: number;
  createTime: string;
  updateTime: string;
  authorNickname: string;
  authorAvatar: string | null;
  categoryName: string;
  tagNames: string[];
  tags?: Tag[];
}

export interface Comment {
  commentId: number;
  articleId: number;
  userId: number;
  parentId: number;
  content: string;
  createTime: string;
  updateTime?: string;
}

export interface AdminComment {
  commentId: number;
  articleId: number;
  articleTitle?: string;
  userId: number;
  userNickname?: string;
  parentId?: number | null;
  content: string;
  createTime: string;
  updateTime?: string;
}

export interface Tag {
  tagId: number;
  tagName: string;
  articleCount?: number;
  createTime?: string;
  updateTime?: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  sort?: number;
  createTime?: string;
  updateTime?: string;
}

export interface Result<T = unknown> {
  code: number;
  success: boolean;
  message: string;
  errorMsg?: string | null;
  data: T;
  total?: number | null;
  suggestion?: string | null;
}

export interface UploadedFile {
  objectKey: string;
  url: string;
}

export interface PrivateMessage {
  id: number;
  senderId: number;
  receiverId?: number;
  senderName: string;
  senderAvatar: string;
  content: string;
  sendTime: string;
  isRead: number;
  mine?: boolean;
}

export interface MessageContact {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
}

interface BackendPage<T> {
  records?: T[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
}

export const articleApi = {
  async getList(params?: {
    current?: number;
    page?: number;
    size?: number;
    categoryId?: number;
    tagId?: number;
    keyword?: string;
    isTop?: number;
    status?: number;
  }) {
    const searchParams = new URLSearchParams();
    const current = params?.current ?? params?.page ?? 1;
    const size = params?.size ?? 10;

    searchParams.set("current", String(current));
    searchParams.set("size", String(size));
    if (params?.categoryId) {
      searchParams.set("categoryId", String(params.categoryId));
    }
    if (params?.tagId) {
      searchParams.set("tagId", String(params.tagId));
    }
    if (params?.keyword?.trim()) {
      searchParams.set("keyword", params.keyword.trim());
    }
    if (typeof params?.isTop === "number") {
      searchParams.set("isTop", String(params.isTop));
    }
    if (typeof params?.status === "number") {
      searchParams.set("status", String(params.status));
    }

    const payload = await request<Result<Article[]>>(
      `/articles?${searchParams.toString()}`
    );
    const { data, total, suggestion } = unwrapResult<Article[]>(payload);

    return {
      items: Array.isArray(data) ? data : [],
      total: total ?? 0,
      current,
      size,
      suggestion,
    };
  },

  async getDetail(articleId: number) {
    const payload = await request<Result<Article>>(`/articles/${articleId}`);
    return unwrapResult<Article>(payload).data;
  },

  async getAdminDetail(articleId: number) {
    const payload = await request<Result<Article>>(`/admin/articles/${articleId}`);
    return unwrapResult<Article>(payload).data;
  },

  async getManageDetail(articleId: number) {
    const payload = await request<Result<Article>>(`/articles/${articleId}/manage`);
    return unwrapResult<Article>(payload).data;
  },

  async getAdminList(params?: {
    current?: number;
    page?: number;
    size?: number;
    categoryId?: number;
    tagId?: number;
    keyword?: string;
    isTop?: number;
    status?: number;
  }) {
    const searchParams = new URLSearchParams();
    const current = params?.current ?? params?.page ?? 1;
    const size = params?.size ?? 10;

    searchParams.set("current", String(current));
    searchParams.set("size", String(size));
    if (params?.categoryId) {
      searchParams.set("categoryId", String(params.categoryId));
    }
    if (params?.tagId) {
      searchParams.set("tagId", String(params.tagId));
    }
    if (params?.keyword?.trim()) {
      searchParams.set("keyword", params.keyword.trim());
    }
    if (typeof params?.isTop === "number") {
      searchParams.set("isTop", String(params.isTop));
    }
    if (typeof params?.status === "number") {
      searchParams.set("status", String(params.status));
    }

    const payload = await request<Result<Article[]>>(
      `/admin/articles?${searchParams.toString()}`
    );
    const { data, total } = unwrapResult<Article[]>(payload);

    return {
      items: Array.isArray(data) ? data : [],
      total: total ?? 0,
      current,
      size,
    };
  },

  async create(data: {
    title: string;
    summary: string;
    content: string;
    cover?: string;
    userId: number;
    categoryId: number;
    status: number;
    tagIds: number[];
  }) {
    const payload = await request<Result<number>>("/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return unwrapResult<number>(payload);
  },

  async update(
    articleId: number,
    data: {
      title: string;
      summary: string;
      content: string;
      cover?: string;
      userId: number;
      categoryId: number;
      status: number;
      tagIds: number[];
    }
  ) {
    const payload = await request<Result<number>>(`/articles/${articleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return unwrapResult<number>(payload);
  },

  async delete(articleId: number) {
    const payload = await request<Result<number>>(`/articles/${articleId}`, {
      method: "DELETE",
    });
    return unwrapResult<number>(payload);
  },

  async deleteAdmin(articleId: number) {
    const payload = await request<Result<number>>(`/admin/articles/${articleId}`, {
      method: "DELETE",
    });
    return unwrapResult<number>(payload);
  },

  async changeAdminTopStatus(articleId: number, isTop: 0 | 1) {
    const payload = await request<Result<number>>(
      `/admin/articles/${articleId}/top?isTop=${isTop}`,
      {
        method: "PATCH",
      }
    );
    return unwrapResult<number>(payload);
  },
};

export const tagApi = {
  async getList(params?: {
    current?: number;
    size?: number;
    keyword?: string;
  }) {
    const searchParams = new URLSearchParams();
    const current = params?.current ?? 1;
    const size = params?.size ?? 10;

    searchParams.set("current", String(current));
    searchParams.set("size", String(size));
    if (params?.keyword?.trim()) {
      searchParams.set("keyword", params.keyword.trim());
    }

    const payload = await request<Result<Tag[]>>(`/tags?${searchParams.toString()}`);
    const { data, total } = unwrapResult<Tag[]>(payload);

    return {
      items: Array.isArray(data) ? data : [],
      total: total ?? 0,
      current,
      size,
    };
  },

  async getAdminList(params?: {
    current?: number;
    size?: number;
    keyword?: string;
  }) {
    const searchParams = new URLSearchParams();
    const current = params?.current ?? 1;
    const size = params?.size ?? 10;

    searchParams.set("current", String(current));
    searchParams.set("size", String(size));
    if (params?.keyword?.trim()) {
      searchParams.set("keyword", params.keyword.trim());
    }

    const payload = await request<Result<Tag[]>>(`/admin/tags?${searchParams.toString()}`);
    const { data, total } = unwrapResult<Tag[]>(payload);

    return {
      items: Array.isArray(data) ? data : [],
      total: total ?? 0,
      current,
      size,
    };
  },

  async getDetail(tagId: number) {
    const payload = await request<Result<Tag>>(`/tags/${tagId}`);
    return unwrapResult<Tag>(payload).data;
  },

  async create(data: { tagName: string }) {
    const payload = await request<Result<number>>("/admin/tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return unwrapResult<number>(payload);
  },

  async update(tagId: number, data: { tagName: string }) {
    const payload = await request<Result<number>>(`/admin/tags/${tagId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return unwrapResult<number>(payload);
  },

  async delete(tagId: number) {
    const payload = await request<Result<number>>(`/admin/tags/${tagId}`, {
      method: "DELETE",
    });
    return unwrapResult<number>(payload);
  },
};

export const categoryApi = {
  async getList() {
    const payload = await request<Result<Category[]>>("/categories");
    const { data } = unwrapResult<Category[]>(payload);
    return Array.isArray(data) ? data : [];
  },

  async getAdminList() {
    const payload = await request<Result<Category[]>>("/admin/categories");
    const { data } = unwrapResult<Category[]>(payload);
    return Array.isArray(data) ? data : [];
  },

  async getDetail(categoryId: number) {
    const payload = await request<Result<Category>>(`/admin/categories/${categoryId}`);
    return unwrapResult<Category>(payload).data;
  },

  async create(data: {
    categoryName: string;
    description?: string;
    sort?: number;
  }) {
    const payload = await request<Result<number>>("/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return unwrapResult<number>(payload);
  },

  async update(
    categoryId: number,
    data: {
      categoryName: string;
      description?: string;
      sort?: number;
    }
  ) {
    const payload = await request<Result<number>>(`/admin/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return unwrapResult<number>(payload);
  },

  async delete(categoryId: number) {
    const payload = await request<Result<number>>(`/admin/categories/${categoryId}`, {
      method: "DELETE",
    });
    return unwrapResult<number>(payload);
  },
};

export const commentApi = {
  async getAdminList(params?: {
    current?: number;
    page?: number;
    size?: number;
    articleId?: number;
    userId?: number;
    keyword?: string;
  }) {
    const searchParams = new URLSearchParams();
    const current = params?.current ?? params?.page ?? 1;
    const size = params?.size ?? 10;

    searchParams.set("current", String(current));
    searchParams.set("size", String(size));
    if (params?.articleId) {
      searchParams.set("articleId", String(params.articleId));
    }
    if (params?.userId) {
      searchParams.set("userId", String(params.userId));
    }
    if (params?.keyword?.trim()) {
      searchParams.set("keyword", params.keyword.trim());
    }

    const payload = await request<Result<AdminComment[]>>(
      `/admin/comments?${searchParams.toString()}`
    );
    const { data, total } = unwrapResult<AdminComment[]>(payload);

    return {
      items: Array.isArray(data) ? data : [],
      total: total ?? 0,
      current,
      size,
    };
  },

  async getTopComments(articleId: number) {
    const payload = await request<Comment[]>(
      `/blog-comments/blog/${articleId}/topCommentList`
    );
    return Array.isArray(payload) ? payload : [];
  },

  async getCommentTree(articleId: number) {
    const payload = await request<Record<string, Comment[]>>(
      `/blog-comments/blog/${articleId}/commentTreeList`
    );
    return isRecord(payload) ? (payload as Record<string, Comment[]>) : {};
  },

  async post(data: {
    content: string;
    userId: number;
    articleId: number;
    parentId?: number;
  }) {
    const payload = await request<Result<void>>("/blog-comments/blog/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        parentId: data.parentId ?? 0,
      }),
    });

    return unwrapResult<void>(payload);
  },

  async delete(commentId: number, userId: number) {
    const payload = await request<Result<void>>(
      `/blog-comments/blog/${commentId}/${userId}/delete`,
      {
        method: "DELETE",
      }
    );

    return unwrapResult<void>(payload);
  },

  async deleteAdmin(commentId: number) {
    const payload = await request<Result<void>>(`/admin/comments/${commentId}`, {
      method: "DELETE",
    });

    return unwrapResult<void>(payload);
  },

  async reply(
    commentId: number,
    commentUserId: number,
    userId: number,
    content: string
  ) {
    const payload = await request<Result<void>>(
      `/blog-comments/blog/${commentId}/${commentUserId}/${userId}/reply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body: content,
      }
    );

    return unwrapResult<void>(payload);
  },
};

export const userApi = {
  // 登录 —— 不变
  async login(username: string, password: string) {
    const params = new URLSearchParams({ username, password });
    const payload = await request<string>(`/auth/login?${params}`, {
      method: "POST",
    });
    const token = String(payload ?? "").trim();
    if (token) {
      localStorage.setItem("token", token);
    }
    return token;
  },

  async adminLogin(username: string, password: string) {
    const params = new URLSearchParams({ username, password });
    const payload = await request<string>(`/auth/admin/login?${params}`, {
      method: "POST",
    });
    const token = String(payload ?? "").trim();
    if (token) {
      localStorage.setItem("token", token);
    }
    return token;
  },

  // 注册
  async register(username: string, email: string, password: string) {
    const params = new URLSearchParams({ username, email, password });
    return request<User>(`/auth/register?${params}`, { method: "POST" });
  },

  // 获取个人资料
  async getProfile() {
    return request<User>("/users/profile");
  },

  async getAdminUsers(params?: {
    current?: number;
    page?: number;
    size?: number;
    keyword?: string;
    role?: number;
  }) {
    const searchParams = new URLSearchParams();
    const current = params?.current ?? params?.page ?? 1;
    const size = params?.size ?? 10;

    searchParams.set("current", String(current));
    searchParams.set("size", String(size));
    if (params?.keyword?.trim()) {
      searchParams.set("keyword", params.keyword.trim());
    }
    if (typeof params?.role === "number") {
      searchParams.set("role", String(params.role));
    }

    const payload = await request<Result<AdminUser[]>>(
      `/admin/users?${searchParams.toString()}`
    );
    const { data, total } = unwrapResult<AdminUser[]>(payload);

    return {
      items: Array.isArray(data) ? data : [],
      total: total ?? 0,
      current,
      size,
    };
  },

  async getAdminUserDetail(userId: number) {
    const payload = await request<Result<AdminUser>>(`/admin/users/${userId}`);
    return unwrapResult<AdminUser>(payload).data;
  },

  async updateAdminUserRole(userId: number, role: 0 | 1) {
    const payload = await request<Result<number>>(`/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });
    return unwrapResult<number>(payload);
  },

  async deleteAdminUser(userId: number) {
    const payload = await request<Result<number>>(`/admin/users/${userId}`, {
      method: "DELETE",
    });
    return unwrapResult<number>(payload);
  },

  // 修改资料
  async updateProfile(data: {
    nickname?: string;
    avatar?: string;
    bio?: string;
  }) {
    const payload = await request<boolean>("/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (payload !== true) throw new Error("资料更新失败");
    return true;
  },

  // 我的文章
  async getMyArticles(status?: string) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    return request<number[]>(`/users/articles?${params}`);
  },

  // 我的评论
  async getMyComments() {
    return request<number[]>("/users/comments");
  },

  // 我的收藏
  async getFavorites() {
    return request<number[]>("/users/favorites");
  },

  // 收藏文章
  async collectArticle(articleId: number) {
    const payload = await request<boolean>(`/users/favorites/${articleId}`, {
      method: "POST",
    });
    if (payload !== true) throw new Error("收藏失败");
    return true;
  },

  // 取消收藏
  async cancelCollect(articleId: number) {
    const payload = await request<boolean>(`/users/favorites/${articleId}`, {
      method: "DELETE",
    });
    if (payload !== true) throw new Error("取消收藏失败");
    return true;
  },
};

export const messageApi = {
  async getInbox(params?: { pageNum?: number; pageSize?: number }) {
    const pageNum = params?.pageNum ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const searchParams = new URLSearchParams({
      pageNum: String(pageNum),
      pageSize: String(pageSize),
    });

    const payload = await request<Result<BackendPage<PrivateMessage>>>(
      `/messages/page?${searchParams.toString()}`
    );
    const page = unwrapResult<BackendPage<PrivateMessage>>(payload).data;

    return {
      items: Array.isArray(page?.records) ? page.records : [],
      total: typeof page?.total === "number" ? page.total : 0,
      current: typeof page?.current === "number" ? page.current : pageNum,
      size: typeof page?.size === "number" ? page.size : pageSize,
      pages: typeof page?.pages === "number" ? page.pages : 0,
    };
  },

  async getContacts(keyword?: string) {
    const searchParams = new URLSearchParams();
    if (keyword?.trim()) {
      searchParams.set("keyword", keyword.trim());
    }

    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const payload = await request<Result<MessageContact[]>>(
      `/messages/contacts${suffix}`
    );
    const { data } = unwrapResult<MessageContact[]>(payload);
    return Array.isArray(data) ? data : [];
  },

  async getConversation(contactId: number, params?: { pageNum?: number; pageSize?: number }) {
    const pageNum = params?.pageNum ?? 1;
    const pageSize = params?.pageSize ?? 50;
    const searchParams = new URLSearchParams({
      pageNum: String(pageNum),
      pageSize: String(pageSize),
    });
    const payload = await request<Result<BackendPage<PrivateMessage>>>(
      `/messages/conversation/${contactId}?${searchParams.toString()}`
    );
    const page = unwrapResult<BackendPage<PrivateMessage>>(payload).data;

    return {
      items: Array.isArray(page?.records) ? page.records : [],
      total: typeof page?.total === "number" ? page.total : 0,
      current: typeof page?.current === "number" ? page.current : pageNum,
      size: typeof page?.size === "number" ? page.size : pageSize,
      pages: typeof page?.pages === "number" ? page.pages : 0,
    };
  },

  async send(receiverId: number, content: string) {
    const searchParams = new URLSearchParams({
      receiverId: String(receiverId),
      content,
    });
    const payload = await request<Result<void>>(
      "/messages/send",
      {
        method: "POST",
        body: searchParams,
      }
    );
    return unwrapResult<void>(payload);
  },

  async markRead(ids: number[]) {
    const payload = await request<Result<void>>("/messages/batch-read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ids),
    });
    return unwrapResult<void>(payload);
  },

  async delete(ids: number[]) {
    const payload = await request<Result<void>>("/messages/batch-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ids),
    });
    return unwrapResult<void>(payload);
  },

  async getDetail(id: number) {
    const payload = await request<Result<PrivateMessage>>(`/messages/detail/${id}`);
    return unwrapResult<PrivateMessage>(payload).data;
  },
};

export const fileApi = {
  async uploadImage(scene: "avatar" | "cover", file: File) {
    const formData = new FormData();
    formData.set("scene", scene);
    formData.set("file", file);

    const payload = await request<Result<UploadedFile>>("/files/upload", {
      method: "POST",
      body: formData,
    });
    return unwrapResult<UploadedFile>(payload).data;
  },
};
