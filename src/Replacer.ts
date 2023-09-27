export class Replacer {

    public static replaceWrapped(str: string, replaceInner: (s: string, start?: number, end?: number) => string, replaceOuter?: (s: string, start?: number, end?: number) => string) {
        let index = 0;
        let isInside = false;
        const opener = "`";
        const closer = "`";
        let lookFor = opener;
        const parts: string[] = [];

        while (true) {
            const next = str.indexOf(lookFor, index);
            if (next < 0) {
                break;
            }
            const part = str.substring(index, next);
            isInside = !isInside;
            lookFor = isInside ? opener : closer;
            if (!isInside) {
                parts.push(replaceInner(part, index, next));
            } else {
                parts.push(replaceOuter ? replaceOuter(part, index, next) : part);
            }
            index = next + 1;
        }
        return parts.join("");
    }
}