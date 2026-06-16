const fs = require('fs/promises');
const path = require('path');
const { minify: minifyJs } = require('terser');
const CleanCSS = require('clean-css');
const { minify: minifyHtml } = require('html-minifier-terser');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

// 源文件路径集中管理，避免后续替换引用时写散。
const paths = {
    snakeJs: path.join(srcDir, 'snake.js'),
    bubblyJs: path.join(srcDir, 'bubbly-bg.js'),
    snakeCss: path.join(srcDir, 'snake.css'),
    sourceHtml: path.join(srcDir, 'index.html'),
    outputJs: path.join(distDir, 'all.min.js'),
    outputCss: path.join(distDir, 'all.min.css'),
    outputHtml: path.join(rootDir, 'index.html')
};

// 压缩并混淆 snake.js，然后拼接已经压缩过的 bubbly-bg.js。
async function buildJavaScript() {
    const [snakeJs, bubblyJs] = await Promise.all([
        fs.readFile(paths.snakeJs, 'utf8'),
        fs.readFile(paths.bubblyJs, 'utf8')
    ]);

    const result = await minifyJs(snakeJs, {
        compress: {
            drop_console: true
        },
        mangle: true,
        format: {
            comments: false
        }
    });

    if (!result.code) {
        throw new Error('snake.js 压缩失败，未生成代码。');
    }

    await fs.writeFile(paths.outputJs, `${result.code}\n${bubblyJs.trim()}\n`, 'utf8');
}

// 压缩 snake.css，输出到 dist/all.min.css，不修改原始 CSS。
async function buildCss() {
    const snakeCss = await fs.readFile(paths.snakeCss, 'utf8');
    const result = new CleanCSS({
        level: 2
    }).minify(snakeCss);

    if (result.errors.length > 0) {
        throw new Error(`snake.css 压缩失败：${result.errors.join('; ')}`);
    }

    await fs.writeFile(paths.outputCss, result.styles, 'utf8');
}

// 基于 src/index.html 生成根目录 index.html，并把资源引用切到 dist 产物。
async function buildHtml() {
    const sourceHtml = await fs.readFile(paths.sourceHtml, 'utf8');
    const htmlWithDistAssets = sourceHtml
        .replace(/\s*<script\s+src=["']snake\.js["']><\/script>\s*/i, '\n    <script src="dist/all.min.js"></script>\n')
        .replace(/\s*<script\s+src=["']bubbly-bg\.js["']><\/script>\s*/i, '\n')
        .replace(/href=["']snake\.css["']/i, 'href="dist/all.min.css"');

    const minifiedHtml = await minifyHtml(htmlWithDistAssets, {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true
    });

    await fs.writeFile(paths.outputHtml, `${minifiedHtml}\n`, 'utf8');
}

// 主流程只负责准备输出目录并串起三个构建步骤。
async function main() {
    await fs.mkdir(distDir, { recursive: true });
    await Promise.all([
        buildJavaScript(),
        buildCss(),
        buildHtml()
    ]);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
