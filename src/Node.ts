export type NodeT<T> = { parent?: NodeT<T>, children: NodeT<T>[], data: T };

export function getLeaves<T>(parent: NodeT<T>) {
    return findNodes(parent, n => !n.children?.length);
}

export function setParents<T>(root: NodeT<T>, recurse: boolean = true) {
    for (const c of root?.children) {
        c.parent = root;
        if (recurse)
            setParents(c, recurse);
    }
}
export function getAncestors<T>(node: NodeT<T>) {
    const result = [];
    while (node.parent) {
        result.push(node.parent);
        node = node.parent;
    }
    return result;
}

export function findNodes<T>(parent: NodeT<T>, check: (node: NodeT<T>) => boolean) {
    const result: NodeT<T>[] = [];
    const rr = (p: NodeT<T>) => {
        if (!p?.children.length) return;
        for (const c of p.children) {
            if (check(c)) {
                result.push(c);
            }
        }
        for (const c of p.children) {
            rr(c);
        }
    }
    rr(parent);
    return result;
}

export function findNode<T>(parent: NodeT<T>, check: (node: NodeT<T>) => boolean) {
    //if (parent.data.title == title) return parent;
    for (const c of parent.children) {
        if (check(c)) return c;
    }
    for (const c of parent.children) {
        const found = findNode(c, check);
        if (found) return found;
    }
    return null;
}
