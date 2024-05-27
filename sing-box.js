const { type, name } = $arguments;
const compatible_outbound = { tag: 'COMPATIBLE', type: 'direct' };

let compatible = false;
let config = JSON.parse($files[0]);

// 生成代理列表
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});

// 将生成的代理添加到配置的outbounds中
config.outbounds.push(...proxies);

// 定义标签与正则表达式的映射关系
const tagRegexMap = {
  'Hong Kong': /港|hk|hongkong|kong kong|🇭🇰/i,
  'Taiwan': /台|tw|taiwan|🇹🇼/i,
  'Japan': /日本|jp|japan|🇯🇵/i,
  'Singapore': /^(?!.*(?:us)).*(新|sg|singapore|🇸🇬)/i,
  'United States': /美|us|unitedstates|united states|🇺🇸/i,
  'Europe': /德国|法国|英国|荷兰|de|fr|gb|nl|germany|france|Great Britain|nederland|🇩🇪|🇫🇷|🇬🇧|🇳🇱/i
};

// 为每个outbound匹配相应的代理
config.outbounds.forEach(outbound => {
  const regex = tagRegexMap[outbound.tag];
  if (regex) {
    outbound.outbounds = outbound.outbounds || [];
    outbound.outbounds.push(...getTags(proxies, regex));
  }
});

// 确保每个outbound至少有一个兼容的outbound
config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound);
      compatible = true;
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

// 序列化配置为JSON格式
$content = JSON.stringify(config, null, 2);

// 辅助函数，根据正则表达式获取代理标签
function getTags(proxies, regex) {
  return proxies.filter(p => regex.test(p.tag)).map(p => p.tag);
}


