import { Replacer } from "./Replacer";
import { SimpleMath } from "./SimpleMath";

export class ContentTools {

    public static process(content: string, preprocess?: (string) => string) {
        if (preprocess != null) {
            content = preprocess(content);
        }
        content = ContentTools.handleFakeTags(content);
        return Replacer.replaceWrapped(content, '`', '`',
            s => SimpleMath.parseMath(s), 
            s => s);
    }

    public static handleFakeTags(str: string) {
        const createRxForTag = (tag: string) => {
            return new RegExp(`\\[${tag}([^\\]]+)\\](.+?)?\\[\/${tag}\\]`, "g");
        }
        const createHandleTag = (tag: string, render: (values: { [name: string]: string }) => string) => {
            const rx = createRxForTag(tag);
        
            return (str: string) => {
                return str.replace(rx, (str: string, ...args: any[]) => {
                    const template = document.createElement("template");
                    template.innerHTML = `<div ${args[0]}>${args[1]}</div>`;
                    const el = template.content.querySelector("div");
                    const x = { "innerHTML": el.innerHTML };
                    el.getAttributeNames().forEach(n => x[n] = el.getAttribute(n));
                    return render(x);
                });
            }
        }
        
        const fExampleRow = createHandleTag("vektorExampleRow", (o) => `<ul><i>${o["prefix"] || ""}</i><b>${o["comment"] || ""}</b>${o["answer"] || ""}${o["innerHTML"] || ""}</ul>`);
        const fAssignment = createHandleTag("vektorAssignment", (o) => `<div><i>${o["prefix"] || ""}</i><b>${o["comment"] || ""}</b>${o["answer"] || ""}${o["innerHTML"] || ""}</div>`);
        
        str = fAssignment(fExampleRow(str))
            .replace(/\[(\/?)(vanstermarginal)\]/g, "<$1h4>")
            .replace(/\[(\/?)(vektorExample)\]/g, "<$1ul>")
            .replace(/\[(\/?)(vektorExampleRow)\]/g, "<$1li>")
            // .replace(/\[(\/?)(vektorExampleRow)\]/g, "")
            .replace(/\[(\/?)(vektorReview)\]/g, (str: string, ...args: any[]) => str.indexOf("[/") < 0 ? `<div style="background-color:#fee">` : "</div>")
            //.replace(/\[(\/?)(definition)\]/g, (str: string, ...args: any[]) => str.indexOf("[/") < 0 ? `<div style="background-color:#efe">` : "</div>")
            .replace(/\[(\/?)(exempel)\]/g, (str: string, ...args: any[]) => str.indexOf("[/") < 0 ? `<div style="background-color:#efe">` : "</div>")
            .replace(/\[(\/?)(exempelSvar)\]/g, (str: string, ...args: any[]) => str.indexOf("[/") < 0 ? `<div style="background-color:#efd">` : "</div>")
            //.replace(/\<(\/?)(oembed)/g, "<$1embed")
            .replace(/src=\"\/([^\""]+)/g, "src=\"https://files.matematik.nokportalen.se/public/$1")
            .replace(/\[input ([^\]]+)\]/g, (str: string, ...args: any[]) => { return `<input type='${args[0] == 'unit="Ja/Nej"' ? "checkbox" : "text"}'>`; })
            ;
          // [exempel]Magnus tog ett lån 
        return str;
    }
}