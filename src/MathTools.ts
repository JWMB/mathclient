import Mexp from "math-expression-evaluator";
import { SimpleMath } from "./SimpleMath";

export const calculateExpression = (expression: string) => {
    if (expression == null || expression.length == 0) return "";
    const mexp = new Mexp();
    try {
      const lexed = mexp.lex(expression, []);
      const postfixed = mexp.toPostfix(lexed);  
      return mexp.postfixEval(postfixed, {});  
    } catch (err) {
      return "??"; //err;
    }
  };

export const renderExpression = (expression: string) => {
    const parsed = SimpleMath.parseMath(expression);
    if (parsed.length && expression.trim().length && expression.indexOf("=") < 0) {
      const calculated = calculateExpression(expression);
      if (calculated != "??") {
        return `${parsed} = ${calculated}`;
      }
    }
    return parsed;
  };