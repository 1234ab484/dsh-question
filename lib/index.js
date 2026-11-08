// Host 半侧：本插件只改 Web 客户端的提问卡片呈现，没有 host 侧逻辑。
// 保留一个空 apply，让 Loader 条目能正常创建/激活（客户端 bundle 由
// @deepseek-ai/dsh-client-modules 依据 package.json 的 dsh.client 提供）。
export const name = 'question-card'

export function apply() {}