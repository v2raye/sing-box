const { type, name } = $arguments;
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
};

let compatible = false;
let config = JSON.parse($files[0]);
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});

const regions = {
  'Hong Kong': /港|hk|hongkong|kong kong|🇭🇰/i,
  'Taiwan': /台|tw|taiwan|🇹🇼/i,
  'Japan': /日本|jp|japan|🇯🇵/i,
  'Singapore': /^(?!.*(?:us)).*(新|sg|singapore|🇸🇬)/i,
  'United States': /美|us|unitedstates|united states|🇺🇸/i,
  'Europe': /德国|法国|英国|荷兰|de|fr|gb|nl|germany|france|Great Britain|nederland|🇩🇪|🇫🇷|🇬🇧|🇳🇱/i
};

config.outbounds.forEach(outbound => {
  Object.entries(regions).forEach(([region, regex]) => {
    if (outbound.tag === region) {
      outbound.outbounds.push(...getTags(proxies, regex));
    }
  });

  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound);
      compatible = true;
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2);

function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag);
}
