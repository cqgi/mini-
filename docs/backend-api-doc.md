# Mini Blog 后端接口文档

## 1. 文档说明

本文档基于当前仓库中的 Spring Boot 后端代码整理，覆盖目前已经暴露的接口、请求参数、响应结构和联调注意事项。

适用对象：

- 前端开发
- 后端联调
- 测试同学
- 项目演示时快速查接口

当前项目主要分为两个模块：

- `personalCenter`
  - 注册、登录、管理员登录
  - 个人资料
  - 我的文章、我的评论、我的收藏
  - 收藏 / 取消收藏
- `contextManagement`
  - 前台文章
  - 后台文章管理
  - 评论管理

## 2. 基础信息

### 2.1 服务地址

默认地址：

```text
http://localhost:8080
```

说明：

- 项目中未单独配置 `server.port`
- Spring Boot 默认端口为 `8080`

### 2.2 数据库配置

当前项目使用：

- MySQL
- 数据库名：`mini_blog`

### 2.3 返回格式说明

当前项目返回格式并不统一。

#### 1. `personalCenter` 模块

直接返回原始类型，例如：

- `User`
- `String`
- `boolean`
- `List<Long>`

#### 2. `contextManagement` 模块

统一返回 `Result`

结构如下：

```json
{
  "code": 200,
  "success": true,
  "message": "success",
  "errorMsg": null,
  "data": {},
  "total": 0
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | number | 业务码，`200` 成功，`400` 失败 |
| success | boolean | 是否成功 |
| message | string | 响应消息 |
| errorMsg | string | 错误消息 |
| data | any | 业务数据 |
| total | number | 分页总数 |

## 3. 认证模块

控制器：

- `src/main/java/com/cug/miniblog/personalCenter/controller/AuthController.java`

基础路径：

```text
/auth
```

### 3.1 用户注册

- 方法：`POST`
- 路径：`/auth/register`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| username | string | 是 | 用户名，4-20 位，字母/数字/下划线 |
| email | string | 是 | 邮箱 |
| password | string | 是 | 密码，6-20 位，必须同时包含字母和数字 |

请求方式：

- 当前为普通表单 / query 参数
- 不是 JSON 请求体

示例：

```http
POST /auth/register?username=jake&email=jake@example.com&password=123456abc
```

返回：

- 类型：`User`

成功示例：

```json
{
  "userId": 33,
  "username": "jake",
  "password": "123456abc",
  "nickname": "用户_12345678",
  "email": "jake@example.com",
  "avatar": "默认头像地址.jpg",
  "bio": "这个家伙很懒什么也没写~~",
  "role": 0,
  "createTime": "2026-04-08T20:00:00",
  "updateTime": "2026-04-08T20:00:00",
  "isDeleted": 0
}
```

说明：

- 当前密码为明文处理，尚未加密
- 当前返回体中会直接带出密码字段，不适合生产环境

### 3.2 用户登录

- 方法：`POST`
- 路径：`/auth/login`

请求参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| username | string | 是 |
| password | string | 是 |

示例：

```http
POST /auth/login?username=jake&password=123456abc
```

返回：

- 类型：`String`

成功示例：

```text
登录成功jake
```

说明：

- 当前不返回 token
- 当前不返回 userId
- 前端联调时需要额外知道数据库中的 `userId`

### 3.3 管理员登录

- 方法：`POST`
- 路径：`/auth/admin/login`

请求参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| username | string | 是 |
| password | string | 是 |

返回：

- 类型：`String`

成功示例：

```text
登录成功，管理员权限adminUser
```

说明：

- 当前通过 `role = 1` 判断管理员

## 4. 用户模块

控制器：

- `src/main/java/com/cug/miniblog/personalCenter/controller/UsersController.java`

基础路径：

```text
/users
```

### 4.1 获取个人资料

- 方法：`GET`
- 路径：`/users/profile`

请求参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |

示例：

```http
GET /users/profile?userId=1
```

返回：

- 类型：`User`

### 4.2 更新个人资料

- 方法：`PUT`
- 路径：`/users/profile`

请求参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |
| nickname | string | 是 |
| avatar | string | 是 |
| bio | string | 是 |

示例：

```http
PUT /users/profile?userId=1&nickname=newName&avatar=https://img.test/avatar.png&bio=hello
```

返回：

- 类型：`boolean`

说明：

- `true` 表示成功
- `false` 表示失败

注意：

- 当前服务层里 `avatar` 也被错误地按 `bio` 的正则校验
- 如果头像地址太长，可能更新失败

### 4.3 获取我的文章

- 方法：`GET`
- 路径：`/users/articles`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| userId | number | 是 | 用户 ID |
| status | string | 否 | `draft` / `pending` / `published` / `failed` |

示例：

```http
GET /users/articles?userId=1&status=pending
```

返回：

- 类型：`List<Long>`

示例：

```json
[1, 3, 8]
```

说明：

- 当前仅返回文章 ID 列表
- 不返回文章详情对象

### 4.4 获取我的评论

- 方法：`GET`
- 路径：`/users/comments`

请求参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |

返回：

- 类型：`List<Long>`

示例：

```json
[11, 12, 20]
```

### 4.5 获取我的收藏

- 方法：`GET`
- 路径：`/users/favorites`

请求参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |

返回：

- 类型：`List<Long>`

示例：

```json
[2, 5, 9]
```

### 4.6 收藏文章

- 方法：`POST`
- 路径：`/users/favorites/{articleId}`

路径参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| articleId | number | 是 |

查询参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |

示例：

```http
POST /users/favorites/2?userId=1
```

返回：

- 类型：`boolean`

说明：

- 当前收藏表 `t_collect` 使用逻辑删除
- `(user_id, article_id)` 存在唯一索引
- 如果历史上收藏过后又取消，再次收藏时，当前后端逻辑会恢复旧记录，而不是新增一条新记录

### 4.7 取消收藏

- 方法：`DELETE`
- 路径：`/users/favorites/{articleId}`

路径参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| articleId | number | 是 |

查询参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| userId | number | 是 |

示例：

```http
DELETE /users/favorites/2?userId=1
```

返回：

- 类型：`boolean`

说明：

- 当前不是物理删除
- 因为 `Collect` 实体启用了 `@TableLogic`
- 实际会把 `is_deleted` 标记为 `1`

## 5. 前台文章模块

控制器：

- `src/main/java/com/cug/miniblog/contextManagement/controller/ArticleController.java`

基础路径：

```text
/articles
```

### 5.1 前台文章列表

- 方法：`GET`
- 路径：`/articles`

请求参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| current | number | 否 | 1 | 页码 |
| size | number | 否 | 10 | 每页数量 |
| keyword | string | 否 | - | 标题关键字 |
| categoryId | number | 否 | - | 分类 ID |
| isTop | number | 否 | - | 0=否，1=是 |

示例：

```http
GET /articles?current=1&size=10&keyword=评论&categoryId=1&isTop=1
```

返回：

- 类型：`Result`

`data` 为文章列表，`total` 为总数。

示例：

```json
{
  "code": 200,
  "success": true,
  "message": "success",
  "errorMsg": null,
  "data": [
    {
      "articleId": 1,
      "title": "文章标题",
      "summary": "文章摘要",
      "cover": "https://example.com/cover.jpg",
      "userId": 1,
      "categoryId": 1,
      "viewCount": 12,
      "isTop": 1,
      "status": 1,
      "createTime": "2026-04-08T12:00:00",
      "updateTime": "2026-04-08T12:00:00",
      "authorNickname": "张三",
      "authorAvatar": "https://example.com/avatar.jpg",
      "categoryName": "后端开发",
      "tagNames": ["Java", "Spring Boot"]
    }
  ],
  "total": 1
}
```

### 5.2 前台文章详情

- 方法：`GET`
- 路径：`/articles/{articleId}`

路径参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| articleId | number | 是 |

示例：

```http
GET /articles/1
```

返回：

- 类型：`Result`

说明：

- 当前只查询 `status = 1` 的文章
- 调用该接口会自动增加浏览量

## 6. 后台文章模块

控制器：

- `src/main/java/com/cug/miniblog/contextManagement/controller/AdminArticleController.java`
- `src/main/java/com/cug/miniblog/contextManagement/controller/ArticleController.java`

### 6.1 后台文章列表

- 方法：`GET`
- 路径：`/admin/articles`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| current | number | 否 | 页码 |
| size | number | 否 | 每页数量 |
| keyword | string | 否 | 标题关键字 |
| categoryId | number | 否 | 分类 ID |
| status | number | 否 | 0=草稿，1=已发布 |
| isTop | number | 否 | 0=否，1=是 |

返回：

- 类型：`Result`

### 6.2 后台文章详情

- 方法：`GET`
- 路径：`/admin/articles/{articleId}`

返回：

- 类型：`Result`

### 6.3 创建文章

- 方法：`POST`
- 路径：`/articles`
- Content-Type：`application/json`

请求体：

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

字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| title | string | 是 | 标题 |
| summary | string | 否 | 摘要 |
| content | string | 是 | 正文 |
| cover | string | 否 | 封面地址 |
| userId | number | 是 | 作者 ID |
| categoryId | number | 是 | 分类 ID |
| status | number | 是 | `0=草稿，1=已发布` |
| tagIds | number[] | 否 | 标签 ID 列表 |

返回：

- 类型：`Result`

成功示例：

```json
{
  "code": 200,
  "success": true,
  "message": "文章创建成功",
  "errorMsg": null,
  "data": 15,
  "total": null
}
```

### 6.4 更新文章

- 方法：`PUT`
- 路径：`/articles/{articleId}`
- Content-Type：`application/json`

请求体结构与创建文章一致。

返回：

- 类型：`Result`

### 6.5 删除文章

- 方法：`DELETE`
- 路径：`/articles/{articleId}`

返回：

- 类型：`Result`

说明：

- 当前为逻辑删除
- `Article` 实体启用了 `@TableLogic`

### 6.6 切换置顶状态

- 方法：`PATCH`
- 路径：`/articles/{articleId}/top`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| isTop | number | 是 | 0=取消置顶，1=置顶 |

示例：

```http
PATCH /articles/1/top?isTop=1
```

返回：

- 类型：`Result`

## 7. 评论模块

控制器：

- `src/main/java/com/cug/miniblog/contextManagement/controller/CommentsController.java`

基础路径：

```text
/blog-comments
```

### 7.1 发表评论

- 方法：`POST`
- 路径：`/blog-comments/blog/post`
- Content-Type：`application/json`

请求体：

```json
{
  "articleId": 1,
  "userId": 1,
  "parentId": 0,
  "content": "这是一条评论"
}
```

字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| articleId | number | 是 | 文章 ID |
| userId | number | 是 | 评论用户 ID |
| parentId | number | 否 | 父评论 ID，一级评论通常传 `0` |
| content | string | 是 | 评论内容 |

返回：

- 类型：`Result`

### 7.2 查询文章一级评论

- 方法：`GET`
- 路径：`/blog-comments/blog/{articleId}/topCommentList`

返回：

- 类型：`List<Comment>`

示例：

```json
[
  {
    "commentId": 11,
    "articleId": 1,
    "userId": 2,
    "parentId": null,
    "content": "写得不错",
    "createTime": "2026-04-08T15:00:00",
    "updateTime": "2026-04-08T15:00:00",
    "isDeleted": 0
  }
]
```

### 7.3 查询评论树

- 方法：`GET`
- 路径：`/blog-comments/blog/{articleId}/commentTreeList`

返回：

- 类型：`HashMap<Long, List<Comment>>`

说明：

- `key` 为父评论 ID
- `value` 为该父评论的直接子评论列表

### 7.4 删除评论

- 方法：`DELETE`
- 路径：`/blog-comments/blog/{commentId}/{userId}/delete`

路径参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| commentId | number | 是 |
| userId | number | 是 |

返回：

- 类型：`Result`

说明：

- 只有评论所属用户自己才能删

### 7.5 回复评论

- 方法：`POST`
- 路径：`/blog-comments/blog/{commentId}/{userId}/reply`
- Content-Type：`text/plain`

路径参数：

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| commentId | number | 是 | 被回复的评论 ID |
| userId | number | 是 | 当前用户 ID |

请求体：

```text
这是一条回复内容
```

返回：

- 类型：`Result`

注意：

- 这个接口不是 JSON 请求体
- 前端需要按纯文本 body 发送

## 8. 核心实体字段

### 8.1 User

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| userId | number | 用户 ID |
| username | string | 用户名 |
| password | string | 密码 |
| nickname | string | 昵称 |
| email | string | 邮箱 |
| avatar | string | 头像 |
| bio | string | 个人简介 |
| role | number | 角色，`0=普通用户，1=管理员` |
| isDeleted | number | 逻辑删除标记 |

### 8.2 Comment

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| commentId | number | 评论 ID |
| articleId | number | 文章 ID |
| userId | number | 用户 ID |
| parentId | number | 父评论 ID |
| content | string | 评论内容 |
| createTime | string | 创建时间 |
| updateTime | string | 更新时间 |
| isDeleted | number | 逻辑删除标记 |

## 9. 当前项目注意事项

### 9.1 无统一鉴权体系

当前项目：

- 登录接口不返回 token
- 没有统一登录拦截器
- 大量接口依赖前端显式传 `userId`

这意味着：

- 适合联调和教学演示
- 不适合直接上线生产

### 9.2 返回结构不统一

- `personalCenter` 返回原始对象
- `contextManagement` 返回 `Result`

前端需要做统一适配。

### 9.3 逻辑删除广泛存在

当前这些实体使用了 `@TableLogic`：

- `Article`
- `Comment`
- `Collect`
- `User`

这意味着：

- “删除”不一定真删库
- 更多时候是把 `is_deleted` 改成 `1`

### 9.4 收藏功能已处理“重复收藏”问题

由于 `t_collect` 使用：

- `is_deleted`
- 唯一索引 `(user_id, article_id)`

所以当前后端逻辑已经改为：

- 已有未删除收藏：直接返回失败
- 已有已删除收藏：恢复旧记录
- 完全不存在：插入新记录

## 10. 源码位置

主要控制器位置：

- `src/main/java/com/cug/miniblog/personalCenter/controller/AuthController.java`
- `src/main/java/com/cug/miniblog/personalCenter/controller/UsersController.java`
- `src/main/java/com/cug/miniblog/contextManagement/controller/ArticleController.java`
- `src/main/java/com/cug/miniblog/contextManagement/controller/AdminArticleController.java`
- `src/main/java/com/cug/miniblog/contextManagement/controller/CommentsController.java`

相关 DTO 与实体：

- `src/main/java/com/cug/miniblog/contextManagement/dto`
- `src/main/java/com/cug/miniblog/common/entity`
