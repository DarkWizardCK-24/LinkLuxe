const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const CODE_LENGTH = 7;

/** Unbiased random integer in [0, max) from Web Crypto (rejection sampling). Works in browsers and Node. */
export function secureInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

/** Cryptographically random base62 code. `pick` can be injected for tests. */
export function generateCode(length: number = CODE_LENGTH, pick: (max: number) => number = secureInt): string {
  let out = "";
  for (let i = 0; i < length; i++) out += BASE62[pick(BASE62.length)];
  return out;
}
