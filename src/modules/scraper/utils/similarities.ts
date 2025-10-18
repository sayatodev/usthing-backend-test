export function normalizeText(text: string): string {
    let t = text.toLowerCase();
    t = t.replace(/[^\w\s]/g, '');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
}

export function sanitizeOutput(text: string): string {
    // Remove non-ascii safely without control-char class ranges that lint flags
    let t = text
        .split('')
        .filter((ch) => ch.charCodeAt(0) <= 127)
        .join('');
    t = t.replace(/[^a-zA-Z0-9\s]/g, '');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
}

export function levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
        new Array<number>(n + 1).fill(0),
    );
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost,
            );
        }
    }
    return dp[m][n];
}

export function similarityRatio(a: string, b: string): number {
    if (!a && !b) return 1;
    const maxLen = Math.max(a.length, b.length) || 1;
    const dist = levenshteinDistance(a, b);
    return 1 - dist / maxLen;
}

export function isNearDuplicate(
    a: string,
    b: string,
    threshold = 0.9,
): boolean {
    return similarityRatio(a, b) >= threshold;
}
