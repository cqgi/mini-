const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type BackendResult<T = unknown> = {
  code?: number;
  success?: boolean;
  message?: string;
  errorMsg?: string | null;
  data?: T;
  total?: number | null;
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
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

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
    };
  }

  return {
    data: payload as T,
    total: null,
    message: "",
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

export interface Tag {
  tagId: number;
  tagName: string;
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
}

export const articleApi = {
  async getList(params?: {
    current?: number;
    page?: number;
    size?: number;
    categoryId?: number;
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
    const { data, total } = unwrapResult<Article[]>(payload);

    return {
      items: Array.isArray(data) ? data : [],
      total: total ?? 0,
      current,
      size,
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
};

export const categoryApi = {
  async getList() {
    const payload = await request<Result<Category[]>>("/categories");
    const { data } = unwrapResult<Category[]>(payload);
    return Array.isArray(data) ? data : [];
  },
};

export const commentApi = {
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
  async login(username: string, password: string) {
    const params = new URLSearchParams({ username, password });
    const payload = await request<string>(`/auth/login?${params}`, {
      method: "POST",
    });
    return typeof payload === "string" ? payload : String(payload ?? "");
  },

  async register(username: string, email: string, password: string) {
    const params = new URLSearchParams({ username, email, password });
    return request<User>(`/auth/register?${params}`, { method: "POST" });
  },

  async getProfile(userId: number) {
    const params = new URLSearchParams({ userId: String(userId) });
    return request<User>(`/users/profile?${params}`);
  },

  async updateProfile(
    userId: number,
    data: {
      nickname?: string;
      avatar?: string;
      bio?: string;
    }
  ) {
    const params = new URLSearchParams({ userId: String(userId) });
    params.set("nickname", data.nickname ?? "");
    params.set("avatar", data.avatar ?? "");
    params.set("bio", data.bio ?? "");

    const payload = await request<boolean>(`/users/profile?${params}`, {
      method: "PUT",
    });

    if (payload !== true) {
      throw new Error("资料更新失败，请检查昵称、头像和简介是否符合后端规则");
    }

    return true;
  },

  async getMyArticles(userId: number, status?: string) {
    const params = new URLSearchParams({ userId: String(userId) });
    if (status && status !== "all") {
      params.set("status", status);
    }

    const payload = await request<number[]>(`/users/articles?${params}`);
    return Array.isArray(payload) ? payload : [];
  },

  async getMyComments(userId: number) {
    const params = new URLSearchParams({ userId: String(userId) });
    const payload = await request<number[]>(`/users/comments?${params}`);
    return Array.isArray(payload) ? payload : [];
  },

  async getFavorites(userId: number) {
    const params = new URLSearchParams({ userId: String(userId) });
    const payload = await request<number[]>(`/users/favorites?${params}`);
    return Array.isArray(payload) ? payload : [];
  },

  async collectArticle(userId: number, articleId: number) {
    const params = new URLSearchParams({ userId: String(userId) });
    const payload = await request<boolean>(
      `/users/favorites/${articleId}?${params}`,
      {
        method: "POST",
      }
    );

    if (payload !== true) {
      throw new Error("收藏失败");
    }

    return true;
  },

  async cancelCollect(userId: number, articleId: number) {
    const params = new URLSearchParams({ userId: String(userId) });
    const payload = await request<boolean>(
      `/users/favorites/${articleId}?${params}`,
      {
        method: "DELETE",
      }
    );

    if (payload !== true) {
      throw new Error("取消收藏失败");
    }

    return true;
  },
};
