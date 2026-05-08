# Mini Blog 前端开发文档

## 1. 文档目标

本文档基于当前后端项目已有能力整理，目标是帮助前端快速完成以下模块的页面开发、接口联调与联调兜底：

- 用户注册、登录、管理员登录
- 个人中心
- 文章前台列表与详情
- 后台文章管理
- 评论发布、删除、回复
- 收藏文章

本文档优先描述“当前后端已经具备的能力”和“前端应该如何接入”，并单独标出当前接口限制与缺失项。

## 2. 当前后端能力概览

### 2.1 已有模块

- `personalCenter`
  - 注册
  - 用户登录
  - 管理员登录
  - 获取/更新个人资料
  - 获取我的文章、我的评论、我的收藏
  - 收藏/取消收藏文章
- `contextManagement`
  - 前台文章列表
  - 前台文章详情
  - 后台文章列表
  - 后台文章详情
  - 新增文章
  - 更新文章
  - 删除文章
  - 文章置顶/取消置顶
  - 发布评论
  - 查询一级评论
  - 查询评论树
  - 删除评论
  - 回复评论

### 2.2 当前运行方式

- 后端框架：Spring Boot 3 + MyBatis-Plus
- JDK 版本：17
- 默认端口：`8080`
  - 项目中未显式配置 `server.port`，Spring Boot 默认使用 `8080`
- 数据库：MySQL
- 当前接口前缀：无统一 `/api` 前缀

### 2.3 当前接口风格差异

当前项目接口返回格式并不统一，前端需要做一层适配：

- `contextManagement` 模块统一返回 `Result`
- `personalCenter` 模块直接返回原始对象或基础类型
  - `User`
  - `String`
  - `boolean`
  - `List<Long>`

建议前端封装统一的 `apiClient` 和 `responseAdapter`，避免页面层直接处理不一致的响应结构。

## 3. 推荐前端技术方案

如果当前还没有前端工程，建议使用以下技术栈：

- 框架：Vue 3
- 构建工具：Vite
- 路由：Vue Router
- 状态管理：Pinia
- 请求库：Axios
- UI 组件：
  - 门户侧：Naive UI 或 Element Plus
  - 后台侧：Element Plus
- 富文本编辑：
  - Markdown 编辑器优先，如 `md-editor-v3`
  - 如果要所见即所得，可选 `wangEditor`

推荐原因：

- 当前项目同时包含“博客前台 + 管理后台 + 个人中心”，Vue 3 对这类中后台与内容型项目落地速度快
- 后端接口较为直接，适合用 Axios + Pinia 做轻量封装

## 4. 建议页面结构

### 4.1 路由规划

- `/`
  - 首页，展示文章列表
- `/articles/:id`
  - 文章详情页
- `/login`
  - 普通用户登录
- `/register`
  - 用户注册
- `/admin/login`
  - 管理员登录
- `/user/profile`
  - 个人资料
- `/user/articles`
  - 我的文章
- `/user/comments`
  - 我的评论
- `/user/favorites`
  - 我的收藏
- `/admin/articles`
  - 后台文章列表
- `/admin/articles/create`
  - 新建文章
- `/admin/articles/:id`
  - 文章详情/编辑页

### 4.2 页面模块拆分

- 门户端
  - 首页文章列表
  - 文章详情
  - 评论区
- 用户端
  - 登录/注册
  - 个人资料编辑
  - 我的文章
  - 我的评论
  - 我的收藏
- 管理端
  - 管理员登录
  - 文章列表管理
  - 新建文章
  - 编辑文章

## 5. 接口清单

以下为当前后端已实现接口，前端可以直接对接。

### 5.1 认证模块

#### 1. 用户注册

- `POST /auth/register`
- 参数：`query/form`

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| username | string | 是 | 4-20 位，字母/数字/下划线 |
| email | string | 是 | 邮箱 |
| password | string | 是 | 6-20 位，必须同时包含字母和数字 |

返回值：

- 类型：`User`

前端处理建议：

- 注册成功后跳转登录页
- 当前后端未返回统一 `code/message`
- 注册失败大概率以异常形式返回，需要统一错误提示

#### 2. 用户登录

- `POST /auth/login`
- 参数：`query/form`

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

返回值：

- 类型：`String`
- 当前示例：`登录成功{username}`

注意：

- 当前并未真正返回 JWT / token
- 前端暂时只能将登录态视为“弱登录”
- 如果要做正式登录态，需要后端补充 token、session 或拦截器

#### 3. 管理员登录

- `POST /auth/admin/login`
- 参数：`query/form`

返回值：

- 类型：`String`
- 当前示例：`登录成功，管理员权限{username}`

### 5.2 个人中心模块

#### 1. 获取个人资料

- `GET /users/profile`

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |

返回值：

- 类型：`User`

#### 2. 更新个人资料

- `PUT /users/profile`

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |
| nickname | string | 是 |
| avatar | string | 是 |
| bio | string | 是 |

返回值：

- 类型：`boolean`

前端校验建议：

- `nickname` 长度 2-20
- `bio` 最长 200

说明：

- 当前服务层把 `avatar` 也按 `bio` 的长度规则在校验，属于后端现状，前端需要准备失败提示

#### 3. 获取我的文章

- `GET /users/articles`

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| userId | number | 是 | 用户 ID |
| status | string | 否 | `draft` / `pending` / `published` / `failed` |

返回值：

- 类型：`List<Long>`
- 含义：仅返回文章 ID 列表

前端建议：

- 当前接口不返回文章详情，需要结合文章详情接口二次拉取，或等待后端补充列表详情接口

#### 4. 获取我的评论

- `GET /users/comments`

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |

返回值：

- 类型：`List<Long>`
- 含义：评论 ID 列表

#### 5. 获取我的收藏

- `GET /users/favorites`

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |

返回值：

- 类型：`List<Long>`
- 含义：收藏文章 ID 列表

#### 6. 收藏文章

- `POST /users/favorites/{articleId}`

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| articleId | number | 是 |
| userId | number | 是 |

返回值：

- 类型：`boolean`

#### 7. 取消收藏

- `DELETE /users/favorites/{articleId}`

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| articleId | number | 是 |
| userId | number | 是 |

返回值：

- 类型：`boolean`

### 5.3 文章模块

#### 1. 前台文章列表

- `GET /articles`
- 参数：`query`

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| current | number | 否 | 1 | 页码 |
| size | number | 否 | 10 | 每页条数 |
| keyword | string | 否 | - | 标题关键词 |
| categoryId | number | 否 | - | 分类 ID |
| isTop | number | 否 | - | 0=否，1=是 |

返回值：

- 类型：`Result`
- `data` 为 `ArticleListVO[]`
- `total` 为总条数

`ArticleListVO` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| articleId | number | 文章 ID |
| title | string | 标题 |
| summary | string | 摘要 |
| cover | string | 封面图 |
| userId | number | 作者 ID |
| categoryId | number | 分类 ID |
| viewCount | number | 浏览量 |
| isTop | number | 是否置顶 |
| status | number | 状态 |
| createTime | string | 创建时间 |
| updateTime | string | 更新时间 |
| authorNickname | string | 作者昵称 |
| authorAvatar | string | 作者头像 |
| categoryName | string | 分类名称 |
| tagNames | string[] | 标签名列表 |

#### 2. 前台文章详情

- `GET /articles/{articleId}`

返回值：

- 类型：`Result`
- `data` 为 `ArticleDetailVO`

`ArticleDetailVO` 额外字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| content | string | 正文 |
| tags | {tagId, tagName}[] | 标签对象数组 |

说明：

- 该接口会自动增加文章浏览量
- 前台详情只查询 `status=1` 的文章

#### 3. 后台文章列表

- `GET /admin/articles`
- 参数：`query`

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| current | number | 否 | 页码 |
| size | number | 否 | 每页条数 |
| keyword | string | 否 | 标题关键词 |
| categoryId | number | 否 | 分类 ID |
| status | number | 否 | 0=草稿，1=已发布 |
| isTop | number | 否 | 0=否，1=是 |

返回值：

- 类型：`Result`
- `data` 为 `ArticleListVO[]`
- `total` 为总条数

#### 4. 后台文章详情

- `GET /admin/articles/{articleId}`

返回值：

- 类型：`Result`
- `data` 为 `ArticleDetailVO`

#### 5. 新建文章

- `POST /articles`
- 请求体：`application/json`

```json
{
  "title": "文章标题",
  "summary": "文章摘要",
  "content": "文章正文",
  "cover": "https://example.com/cover.jpg",
  "userId": 1,
  "categoryId": 1,
  "status": 0,
  "tagIds": [1, 2, 3]
}
```

返回值：

- 类型：`Result`
- 成功时 `data` 为新建文章 ID

#### 6. 更新文章

- `PUT /articles/{articleId}`
- 请求体：`application/json`
- 结构与新建文章一致

返回值：

- 类型：`Result`
- 成功时 `data` 为文章 ID

#### 7. 删除文章

- `DELETE /articles/{articleId}`

返回值：

- 类型：`Result`

说明：

- 当前为逻辑删除

#### 8. 切换置顶状态

- `PATCH /articles/{articleId}/top?isTop=1`

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| isTop | number | 是 | 0=取消置顶，1=置顶 |

返回值：

- 类型：`Result`

### 5.4 评论模块

#### 1. 发布评论

- `POST /blog-comments/blog/post`
- 请求体：`application/json`

```json
{
  "articleId": 1,
  "userId": 1,
  "parentId": 0,
  "content": "评论内容"
}
```

返回值：

- 类型：`Result`

说明：

- `parentId=0` 时会被后端视为一级评论

#### 2. 查询一级评论

- `GET /blog-comments/blog/{articleId}/topCommentList`

返回值：

- 类型：`Comment[]`

#### 3. 查询评论树

- `GET /blog-comments/blog/{articleId}/commentTreeList`

返回值：

- 类型：`Record<number, Comment[]>`
- 含义：`key=父评论ID`，`value=该父评论下的直接子评论列表`

前端建议：

- 评论区可先调用一级评论接口
- 再调用评论树接口，将子评论按 `parentId` 挂到对应一级评论下

#### 4. 删除评论

- `DELETE /blog-comments/blog/{commentId}/{userId}/delete`

返回值：

- 类型：`Result`

#### 5. 回复评论

- `POST /blog-comments/blog/{commentId}/{userId}/reply`
- 请求体：纯文本字符串

返回值：

- 类型：`Result`

说明：

- 当前回复接口不是 JSON，而是原始字符串 body，前端需要单独设置请求体格式

## 6. 关键数据模型

### 6.1 User

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| userId | number | 用户 ID |
| username | string | 用户名 |
| password | string | 密码 |
| nickname | string | 昵称 |
| email | string | 邮箱 |
| avatar | string | 头像 |
| bio | string | 个人简介 |
| role | number | 角色，推测 0=普通用户，1=管理员 |

### 6.2 Article

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| articleId | number | 文章 ID |
| title | string | 标题 |
| summary | string | 摘要 |
| content | string | 正文 |
| cover | string | 封面 |
| userId | number | 作者 ID |
| categoryId | number | 分类 ID |
| viewCount | number | 浏览量 |
| isTop | number | 是否置顶 |
| status | number | 状态 |

说明：

- `contextManagement` 中 `status` 实际使用：`0=草稿，1=已发布`
- `personalCenter` 中我的文章筛选使用：`draft/pending/published/failed -> 0/1/2/3`
- 两个模块的状态定义当前并不一致，前端需要避免共用同一套状态枚举

### 6.3 Comment

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| commentId | number | 评论 ID |
| articleId | number | 文章 ID |
| userId | number | 评论用户 ID |
| parentId | number | 父评论 ID，一级评论通常为空 |
| content | string | 评论内容 |

## 7. 前端状态管理建议

建议至少拆分以下 store：

- `authStore`
  - `currentUser`
  - `role`
  - `loginType`
- `articleStore`
  - 前台文章列表
  - 文章详情缓存
  - 后台文章列表
- `profileStore`
  - 用户资料
  - 我的文章 ID 列表
  - 我的评论 ID 列表
  - 我的收藏 ID 列表
- `commentStore`
  - 一级评论
  - 评论树映射

## 8. 页面交互建议

### 8.1 首页

- 顶部展示登录入口、注册入口、个人中心入口
- 主体展示文章列表
- 支持关键词搜索
- 支持按分类筛选
- 置顶文章优先展示

### 8.2 文章详情页

- 展示封面、标题、作者信息、分类、标签、正文
- 展示评论区
- 支持发表评论
- 支持回复评论
- 支持收藏文章

### 8.3 个人中心

- 基础资料卡片
- 编辑昵称/头像/简介
- Tab 切换：
  - 我的文章
  - 我的评论
  - 我的收藏

### 8.4 后台文章管理

- 列表页支持：
  - 分页
  - 关键字搜索
  - 分类筛选
  - 状态筛选
  - 置顶筛选
- 编辑页支持：
  - 标题
  - 摘要
  - 正文
  - 封面
  - 分类
  - 标签
  - 草稿/发布
  - 置顶切换

## 9. 当前后端限制与前端应对方案

### 9.1 暂无真正鉴权体系

现状：

- 登录接口只返回字符串
- 没有 JWT、session、登录拦截器、权限校验

前端建议：

- 开发阶段可将登录成功结果存入本地状态
- 路由守卫先基于本地状态做演示级控制
- 正式上线前必须补充后端鉴权

### 9.2 接口返回格式不统一

现状：

- 一部分接口返回 `Result`
- 一部分接口返回原始数据

前端建议：

- 请求层做统一适配：
  - 如果存在 `code/success`，按 `Result` 处理
  - 否则直接返回原始 `data`

### 9.3 个人中心多个列表只返回 ID

现状：

- 我的文章、我的评论、我的收藏目前只返回 ID 列表

前端建议：

- 先以“基础版本”实现 ID 列表展示
- 或在前端通过详情接口逐条补数据
- 更推荐后端补充带展示字段的列表接口

### 9.4 分类和标签缺少独立查询接口

现状：

- 当前项目中未看到单独的分类列表、标签列表接口

前端建议：

- 开发阶段先使用静态枚举或 mock 数据
- 后续由后端补充：
  - `GET /categories`
  - `GET /tags`

### 9.5 评论返回结构偏底层

现状：

- 一级评论和评论树拆成两个接口
- 返回的是 `Comment` 实体，没有用户昵称、头像等展示字段

前端建议：

- 评论区先实现基础版
- 如果要正式展示，需要后端补充评论展示 VO

## 10. 推荐开发顺序

### 第一阶段

- 登录页
- 注册页
- 首页文章列表
- 文章详情页

### 第二阶段

- 评论区
- 收藏功能
- 个人资料页
- 我的收藏页

### 第三阶段

- 后台文章列表
- 新建文章
- 编辑文章
- 删除/置顶文章

## 11. 联调前建议

前后端联调前建议统一以下内容：

- 是否统一加 `/api` 前缀
- 登录后是否改为返回 token
- 用户信息是否通过 token 获取，而不是每次传 `userId`
- 我的文章/评论/收藏是否返回详情对象而不只是 ID
- 是否补充分类、标签、评论展示接口
- 文章状态枚举是否统一

## 12. 文档对应后端源码位置

- 认证接口：`src/main/java/com/cug/miniblog/personalCenter/controller/AuthController.java`
- 用户接口：`src/main/java/com/cug/miniblog/personalCenter/controller/UsersController.java`
- 文章接口：`src/main/java/com/cug/miniblog/contextManagement/controller/ArticleController.java`
- 后台文章接口：`src/main/java/com/cug/miniblog/contextManagement/controller/AdminArticleController.java`
- 评论接口：`src/main/java/com/cug/miniblog/contextManagement/controller/CommentsController.java`
- 文章返回结构：`src/main/java/com/cug/miniblog/contextManagement/vo`
- 公共实体：`src/main/java/com/cug/miniblog/common/entity`
