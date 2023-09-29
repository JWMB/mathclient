import { Replacer } from "./Replacer";
import { SimpleMath } from "./SimpleMath";

export class ContentTools {

    public static process(content: string, preprocess?: (string) => string) {
        content = ContentTools.handleFakeTags(content);
        return Replacer.replaceWrapped(content, 
            s => SimpleMath.parseMath(s), 
            s => s);
    }

    // const aaa = '[vektorAssignment prefix=\"a)\" answer=\"`7 - 5 = 2`<br><br>Svar: Ökningen är 2 procentenheter.\" comment=\"Procentenheter är skillnaden mellan antalet procent.\" toggle=\"true\"] procentenheter [/vektorAssignment]';
// console.log(aaa.replace(/\[(\/?)(vektorAssignment[^\]]*)\]/g, ""));
    // lesson = Replacer.replaceWrapped(lessonBody, 
    //     s => SimpleMath.parseMath(s), 
    //     s => s);

    public static handleFakeTags(str: string) {
        const createRxForTag = (tag: string) => {
            return new RegExp(`\\[${tag}([^\\]]+)\\](.+?)?\\[\/${tag}\\]`, "g");
        }
        const createHandleTag = (tag: string, render: (values: { [name: string]: string }) => string) => {
            const rx = createRxForTag(tag);
        
            return (str: string) => {
                return str.replace(rx, (str: string, ...args: any[]) => {
                    const template = document.createElement("template");
                    // console.log(str, args);
                    template.innerHTML = `<div ${args[0]}>${args[1]}</div>`;
                    const el = template.content.querySelector("div");
                    // const pairs = el.getAttributeNames().map(n => [n, el.getAttribute(n)]).concat([["", ""]);
                    // pairs.push(["innerHTML", el.innerHTML]);
                    // const attrs = new Map<string, string>(pairs);
                    const x = { "innerHTML": el.innerHTML };
                    el.getAttributeNames().forEach(n => x[n] = el.getAttribute(n));
                    // console.log("x", x);
                    // console.log("render", render(x));
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
            .replace(/\[(\/?)(vektorGreen)\]/g, (str: string, ...args: any[]) => str.indexOf("[/") < 0 ? `<div style="background-color:#efe">` : "</div>")
            //.replace(/\<(\/?)(oembed)/g, "<$1embed")
            .replace(/src=\"\/([^\""]+)/g, "src=\"https://files.matematik.nokportalen.se/public/$1")
            .replace(/\[input ([^\]]+)\]/g, "<input type='text'>")
            ;
          
        // [input unit="Ja/Nej"]
        // return handleAssignment(str);
        return str;
    }
}