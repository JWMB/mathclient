// export class MathJax {

// }

export function insertMathJaxScript() {
    let script = document.createElement('script');
		
    script.onload = () => {
        const mj = (<any>window).MathJax;
        mj.tex = { inlineMath: [['$', '$'], ['\\(', '\\)']] };
        mj.svg = { fontCache: 'global' };

        // (<any>window).MathJax = {
        //     tex: {inlineMath: [['$', '$'], ['\\(', '\\)']]},
        //     svg: {fontCache: 'global'}
        // };
    };

    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
    document.head.append(script);
};
