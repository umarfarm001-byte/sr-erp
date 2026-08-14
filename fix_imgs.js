const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', 'utf-8');
c = c.replace('import { ArrowLeft', 'import ZoomableImage from ""@/components/ui/ZoomableImage"";\nimport { ArrowLeft');
c = c.replace(/<img\s+src=\{([^}]+)\}\s+alt=\{([^\}]+)\}\s+className="([^"]+)"\s*\/>/g, '<ZoomableImage src={$1} alt={$2} className="$3" />');
c = c.replace(/<img\s+src=\{([^}]+)\}\s+alt="([^"]+)"\s+className="([^"]+)"\s*\/>/g, '<ZoomableImage src={$1} alt="$2" className="$3" />');
c = c.replace(/<img\s+src=\{([^}]+)\}\s+className="([^"]+)"\s*\/>/g, '<ZoomableImage src={$1} className="$2" />');
c = c.replace(/<img\s+src=\{([^}]+)\}\s+className="([^"]+)"\/>/g, '<ZoomableImage src={$1} className="$2" />');
fs.writeFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', c);
