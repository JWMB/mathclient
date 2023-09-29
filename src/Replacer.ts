export class Replacer {

    public static replaceWrapped(str: string, openingString: string, closingString: string, replaceInner: (s: string, start?: number, end?: number) => string, replaceOuter?: (s: string, start?: number, end?: number) => string) {
        let index = 0;
        let isInside = false;
        let lookFor = openingString;
        const parts: string[] = [];

        while (true) {
            const next = str.indexOf(lookFor, index);
            if (next < 0) {
                break;
            }
            const part = str.substring(index, next);
            isInside = !isInside;
            lookFor = isInside ? openingString : closingString;
            if (!isInside) {
                parts.push(replaceInner(part, index, next));
            } else {
                parts.push(replaceOuter ? replaceOuter(part, index, next) : part);
            }
            index = next + 1;
        }
        return parts.length ? parts.join("") : str;
    }
}