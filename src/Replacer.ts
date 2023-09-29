export class Replacer {

    public static replaceWrapped(str: string, openingString: string, closingString: string, replaceInner: (s: string, start?: number, end?: number) => string, replaceOuter?: (s: string, start?: number, end?: number) => string) {
        let index = 0;
        let isInside = false;
        let lookFor = openingString;
        const parts: string[] = [];

        const add = (i: number, n: number) => {
            const part = str.substring(i, n);
            if (!isInside) {
                parts.push(replaceInner(part, i, n));
            } else {
                parts.push(replaceOuter ? replaceOuter(part, i, n) : part);
            }
        };
        while (true) {
            const next = str.indexOf(lookFor, index);
            isInside = !isInside;
            if (next < 0) {
                add(index, str.length);
                break;
            }
            add(index, next);
            lookFor = isInside ? openingString : closingString;
            index = next + 1;
        }
        return parts.length ? parts.join("") : (replaceOuter ? replaceOuter(str, index) : str);
    }
}