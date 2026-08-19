import { definePlugin, defineRule } from "@oxlint/plugins";

const noChainedTypeAssertions = defineRule({
  create(context) {
    return {
      TSAsExpression(node: any) {
        if (
          node.expression &&
          (node.expression.type === "TSAsExpression" ||
            node.expression.type === "TSTypeAssertion" ||
            node.expression.type === "TSSatisfiesExpression")
        ) {
          context.report({
            node,
            message: "Do not chain type assertions (e.g. `x as unknown as Y`). Avoid intermediate type casts.",
          });
        }
      },
      TSTypeAssertion(node: any) {
        if (
          node.expression &&
          (node.expression.type === "TSAsExpression" ||
            node.expression.type === "TSTypeAssertion" ||
            node.expression.type === "TSSatisfiesExpression")
        ) {
          context.report({
            node,
            message: "Do not chain type assertions. Avoid intermediate type casts.",
          });
        }
      },
    };
  },
});

const noConditionalEmptyObjectSpread = defineRule({
  create(context) {
    return {
      SpreadElement(node: any) {
        const arg = node.argument;
        if (!arg) return;
        if (arg.type === "ConditionalExpression") {
          const isConsequentEmpty = arg.consequent?.type === "ObjectExpression" && arg.consequent.properties?.length === 0;
          const isAlternateEmpty = arg.alternate?.type === "ObjectExpression" && arg.alternate.properties?.length === 0;
          if (isConsequentEmpty || isAlternateEmpty) {
            context.report({
              node,
              message: "Do not use conditional empty object spread `...(cond ? { ... } : {})`. Use explicit object properties instead.",
            });
          }
        } else if (arg.type === "LogicalExpression" && arg.operator === "&&") {
          if (arg.right?.type === "ObjectExpression") {
            context.report({
              node,
              message: "Do not use conditional object spread `...(cond && { ... })`. Use explicit object properties instead.",
            });
          }
        }
      },
    };
  },
});

const noKnownValueWidening = defineRule({
  create(context) {
    return {
      VariableDeclarator(node: any) {
        if (!node.id || !node.init) return;
        const typeAnnotation = node.id.typeAnnotation?.typeAnnotation;
        if (!typeAnnotation) return;

        const isPrimitiveType =
          typeAnnotation.type === "TSStringKeyword" ||
          typeAnnotation.type === "TSNumberKeyword" ||
          typeAnnotation.type === "TSBooleanKeyword";

        const isLiteralValue =
          node.init.type === "Literal" ||
          node.init.type === "StringLiteral" ||
          node.init.type === "NumericLiteral" ||
          node.init.type === "BooleanLiteral";

        if (isPrimitiveType && isLiteralValue) {
          context.report({
            node,
            message: "Avoid explicitly typing literal initialization with wide primitive types. Rely on type inference or use `as const`.",
          });
        }
      },
    };
  },
});

const noModuleMocking = defineRule({
  create(context) {
    return {
      CallExpression(node: any) {
        const callee = node.callee;
        if (
          callee &&
          callee.type === "MemberExpression" &&
          callee.object?.type === "Identifier" &&
          (callee.object.name === "vi" || callee.object.name === "jest") &&
          callee.property?.type === "Identifier" &&
          callee.property.name === "mock"
        ) {
          context.report({
            node,
            message: "Do not use module mocking (`vi.mock` / `jest.mock`). Prefer dependency injection or real implementations.",
          });
        }
      },
    };
  },
});

const noObjectParameters = defineRule({
  create(context) {
    return {
      FunctionDeclaration(node: any) {
        checkParams(node, context);
      },
      FunctionExpression(node: any) {
        checkParams(node, context);
      },
      ArrowFunctionExpression(node: any) {
        checkParams(node, context);
      },
    };
  },
});

function checkParams(node: any, context: any) {
  if (!node.params) return;
  for (const param of node.params) {
    const annotation = param.typeAnnotation?.typeAnnotation;
    if (annotation && annotation.type === "TSObjectKeyword") {
      context.report({
        node: param,
        message: "Do not use `Object` as a parameter type. Use a specific interface, type, or `Record<string, unknown>`.",
      });
    }
  }
}

const noReflectApply = defineRule({
  create(context) {
    return {
      CallExpression(node: any) {
        const callee = node.callee;
        if (
          callee &&
          callee.type === "MemberExpression" &&
          callee.object?.type === "Identifier" &&
          callee.object.name === "Reflect" &&
          callee.property?.type === "Identifier" &&
          callee.property.name === "apply"
        ) {
          context.report({
            node,
            message: "Avoid `Reflect.apply`. Use direct function calls or `Function.prototype.apply`.",
          });
        }
      },
    };
  },
});

const noReflectGet = defineRule({
  create(context) {
    return {
      CallExpression(node: any) {
        const callee = node.callee;
        if (
          callee &&
          callee.type === "MemberExpression" &&
          callee.object?.type === "Identifier" &&
          callee.object.name === "Reflect" &&
          callee.property?.type === "Identifier" &&
          callee.property.name === "get"
        ) {
          context.report({
            node,
            message: "Avoid `Reflect.get`. Use direct property access `obj[key]` instead.",
          });
        }
      },
    };
  },
});

const noRuntimeTypeof = defineRule({
  create(context) {
    return {
      BinaryExpression(node: any) {
        if (!["==", "===", "!=", "!=="].includes(node.operator)) return;
        const leftIsTypeof = node.left?.type === "UnaryExpression" && node.left.operator === "typeof";
        const rightIsTypeof = node.right?.type === "UnaryExpression" && node.right.operator === "typeof";
        const leftIsUndefined = (node.left?.type === "Literal" || node.left?.type === "StringLiteral") && node.left.value === "undefined";
        const rightIsUndefined = (node.right?.type === "Literal" || node.right?.type === "StringLiteral") && node.right.value === "undefined";

        if ((leftIsTypeof && rightIsUndefined) || (rightIsTypeof && leftIsUndefined)) {
          context.report({
            node,
            message: "Avoid runtime `typeof x === 'undefined'` checks where TypeScript types can guarantee presence.",
          });
        }
      },
    };
  },
});

const noShapeInSymbolNames = defineRule({
  create(context) {
    return {
      TSTypeAliasDeclaration(node: any) {
        checkSymbolName(node.id, context);
      },
      TSInterfaceDeclaration(node: any) {
        checkSymbolName(node.id, context);
      },
    };
  },
});

function checkSymbolName(id: any, context: any) {
  if (!id || typeof id.name !== "string") return;
  const name = id.name;
  if (
    name.endsWith("Shape") ||
    (name.endsWith("Type") && name !== "Type") ||
    name.endsWith("Interface") ||
    /^I[A-Z]/.test(name)
  ) {
    context.report({
      node: id,
      message: `Do not include structural shapes or type prefixes/suffixes in symbol names ('${name}'). Use clear domain-oriented names.`,
    });
  }
}

const noUnknownParameters = defineRule({
  create(context) {
    return {
      FunctionDeclaration(node: any) {
        checkUnknownParams(node, context);
      },
      FunctionExpression(node: any) {
        checkUnknownParams(node, context);
      },
      ArrowFunctionExpression(node: any) {
        checkUnknownParams(node, context);
      },
    };
  },
});

function checkUnknownParams(node: any, context: any) {
  if (!node.params) return;
  for (const param of node.params) {
    const annotation = param.typeAnnotation?.typeAnnotation;
    if (annotation && annotation.type === "TSUnknownKeyword") {
      context.report({
        node: param,
        message: "Avoid `unknown` as a parameter type without explicit validation or generic bounds.",
      });
    }
  }
}

const noUnknownReturns = defineRule({
  create(context) {
    return {
      FunctionDeclaration(node: any) {
        checkUnknownReturn(node, context);
      },
      FunctionExpression(node: any) {
        checkUnknownReturn(node, context);
      },
      ArrowFunctionExpression(node: any) {
        checkUnknownReturn(node, context);
      },
    };
  },
});

function checkUnknownReturn(node: any, context: any) {
  const returnType = node.returnType?.typeAnnotation;
  if (returnType && returnType.type === "TSUnknownKeyword") {
    context.report({
      node: node.returnType,
      message: "Avoid explicit `unknown` return types. Prefer typed returns or generic return types.",
    });
  }
}

const noUnknownTypeAliases = defineRule({
  create(context) {
    return {
      TSTypeAliasDeclaration(node: any) {
        if (node.typeAnnotation?.type === "TSUnknownKeyword") {
          context.report({
            node,
            message: "Do not create type aliases for `unknown`.",
          });
        }
      },
    };
  },
});

const noUnsafeDictionaryType = defineRule({
  create(context) {
    return {
      TSTypeReference(node: any) {
        if (
          node.typeName?.type === "Identifier" &&
          node.typeName.name === "Record" &&
          node.typeParameters?.params?.length === 2
        ) {
          const valType = node.typeParameters.params[1];
          if (valType.type === "TSAnyKeyword") {
            context.report({
              node,
              message: "Do not use unsafe dictionary types `Record<..., any>`. Use `unknown` or specific value types instead.",
            });
          }
        }
      },
      TSTypeLiteral(node: any) {
        if (!node.members) return;
        for (const member of node.members) {
          if (member.type === "TSIndexSignature" && member.typeAnnotation?.typeAnnotation?.type === "TSAnyKeyword") {
            context.report({
              node: member,
              message: "Do not use unsafe index signature `[key: string]: any`. Use `unknown` or specific value types instead.",
            });
          }
        }
      },
    };
  },
});

const noWidenThenAssert = defineRule({
  create(context) {
    return {
      TSAsExpression(node: any) {
        if (node.expression?.type === "TSAsExpression") {
          const innerType = node.expression.typeAnnotation;
          if (
            innerType &&
            (innerType.type === "TSAnyKeyword" || innerType.type === "TSUnknownKeyword")
          ) {
            context.report({
              node,
              message: "Avoid widening a type to `any`/`unknown` before asserting to another type.",
            });
          }
        }
      },
    };
  },
});

const requireSafetyCommentForTypeAssertion = defineRule({
  create(context: any) {
    return {
      TSAsExpression(node: any) {
        // Exempt const assertions (e.g. `as const`)
        if (
          node.typeAnnotation?.type === "TSTypeReference" &&
          node.typeAnnotation?.typeName?.name === "const"
        ) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode?.();
        const comments = sourceCode ? (sourceCode.getCommentsBefore?.(node) || sourceCode.getComments?.(node) || []) : [];
        const hasSafetyComment = Array.isArray(comments) && comments.some((c: any) => /safety/i.test(c.value));

        if (!hasSafetyComment) {
          const textBefore = sourceCode?.text ? sourceCode.text.slice(Math.max(0, node.range[0] - 200), node.range[0]) : "";
          if (!/safety/i.test(textBefore)) {
            context.report({
              node,
              message: "Type assertions (`as ...`) require an accompanying safety comment (e.g. `// SAFETY: ...`).",
            });
          }
        }
      },
    };
  },
});

export default definePlugin({
  meta: {
    name: "anti-slop",
  },
  rules: {
    "no-chained-type-assertions": noChainedTypeAssertions,
    "no-conditional-empty-object-spread": noConditionalEmptyObjectSpread,
    "no-known-value-widening": noKnownValueWidening,
    "no-module-mocking": noModuleMocking,
    "no-object-parameters": noObjectParameters,
    "no-reflect-apply": noReflectApply,
    "no-reflect-get": noReflectGet,
    "no-runtime-typeof": noRuntimeTypeof,
    "no-shape-in-symbol-names": noShapeInSymbolNames,
    "no-unknown-parameters": noUnknownParameters,
    "no-unknown-returns": noUnknownReturns,
    "no-unknown-type-aliases": noUnknownTypeAliases,
    "no-unsafe-dictionary-type": noUnsafeDictionaryType,
    "no-widen-then-assert": noWidenThenAssert,
    "require-safety-comment-for-type-assertion": requireSafetyCommentForTypeAssertion,
  },
});
