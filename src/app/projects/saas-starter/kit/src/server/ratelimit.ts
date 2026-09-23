// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * ログインと招待の回数の上限です。
 *
 * 入れ物はメモリなので、サーバーが複数台あるときや、再起動したときは数え直しになります。
 * Vercel などに載せるときは、Upstash Redis などの実装に差し替えてください
 * （RateLimiter を実装した値を flow に渡すだけです。手順は README に書いてあります）。
 */

export type RateLimitKey = string;

export type RateLimitVerdict = {
  allowed: boolean;
  /** 次に試していただけるまでの秒数（通ったときは 0） */
  retryAfterSeconds: number;
};

export interface RateLimiter {
  hit(key: RateLimitKey, now: Date): Promise<RateLimitVerdict>;
}

export type MemoryRateLimiterOptions = {
  /** 窓の中で通す回数 */
  limit: number;
  /** 窓の長さ（秒） */
  windowSeconds: number;
  /** 覚えておく鍵の数の上限。既定 10000。超えたら古い順に捨てます */
  max?: number;
};

type Bucket = { startedAt: number; count: number };

const DEFAULT_MAX_KEYS = 10000;

/** 鍵ごとに「窓の始まり」と「回数」を持つ、固定窓の数え方です */
export function createMemoryRateLimiter(options: MemoryRateLimiterOptions): RateLimiter {
  const maxKeys = options.max ?? DEFAULT_MAX_KEYS;
  const windowMs = options.windowSeconds * 1000;
  const buckets = new Map<RateLimitKey, Bucket>();

  return {
    async hit(key: RateLimitKey, now: Date): Promise<RateLimitVerdict> {
      const at = now.getTime();
      const previous = buckets.get(key);

      // いったん外してから入れ直すと、Map の並びが「最後に使った順」になります
      buckets.delete(key);

      const expired = previous === undefined || at - previous.startedAt >= windowMs;
      const bucket: Bucket = expired
        ? { startedAt: at, count: 1 }
        : { startedAt: previous.startedAt, count: previous.count + 1 };
      buckets.set(key, bucket);

      while (buckets.size > maxKeys) {
        const oldest = buckets.keys().next();
        if (oldest.done === true) break;
        buckets.delete(oldest.value);
      }

      if (bucket.count <= options.limit) return { allowed: true, retryAfterSeconds: 0 };

      const remainMs = bucket.startedAt + windowMs - at;
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(remainMs / 1000)) };
    },
  };
}

/** ログイン・登録・メールのリンク: メールアドレスと IP ごとに 10 分で 10 回 */
export const LOGIN_LIMIT = { limit: 10, windowSeconds: 600 };

/**
 * ログイン・登録・メールのリンクの 2 本目の窓: IP ごとに 10 分で 50 回。
 *
 * 1 本目の窓はメールアドレスごとに数えるため、メールアドレスを変えながら
 * 何度も試す形は止められません。メールアドレスを含まないこの窓が、その分を受け持ちます
 * （ご家庭や職場で IP を分け合う方のことを考えて、1 本目より広くしてあります）。
 */
export const LOGIN_IP_LIMIT = { limit: 50, windowSeconds: 600 };

/** 招待の発行: 組織ごとに 1 時間で 20 回 */
export const INVITE_LIMIT = { limit: 20, windowSeconds: 3600 };

/** 招待をお受けいただくとき: IP ごとに 1 時間で 20 回 */
export const INVITE_ACCEPT_LIMIT = { limit: 20, windowSeconds: 3600 };
