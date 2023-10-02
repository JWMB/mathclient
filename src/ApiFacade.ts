import { ApiClient } from "./ApiClient";
import type { Content } from "./lib/LessonTypes";
import type { Assignment } from "./lib/AssignmentTypes";
import { assignment2, assignments_141094_16961, course_16961, course_2982 } from "./assets/lesson";
import { setParents, type NodeT } from './Node';


export class ApiWrapper {
    readonly baseUrl: string = "https://localhost:7134/api/v2/";
    private client: ApiClient;

    constructor() {
    }

    public refresh(auth: string) {
        this.client = new ApiClient(this.baseUrl, auth);
    }

    public async getCourses(ids: number[], mockFallback?: boolean) {
        const root = <XNode>{ children: [], data: { title: "ROOT", type: NodeType.Root } };
        for (const id of ids) {
            const c = await this.getCourse(id, mockFallback);
            if (c) {
                console.log("success loading", id);
                const node = <XNode>{ parent: root, children: c.root.children, data: { title: `${id}`, id: id, type: NodeType.Course } };
                setParents(node, false);
                root.children.push(node);
            }
        }
        return root;
    }

    public async getCourse(id: number, mockFallback?: boolean) {
        let root = await this.client.getCourse(id);
        if (root == null) {
            console.warn("no course");
            if (mockFallback) {
                root = { content: <Content>(<any>course_16961.content) };
            }
        }
        return root?.content ? { content: root.content, id: id, root: LessonStuff.parseToTree(root.content) } : null;
    }

    public async getAssignments(courseId: number, hierarchyId: number, assignmentId?: number) {
        const assignments = await this.client.getAssignments(courseId, hierarchyId, assignmentId);
        if (assignments == null) {
            console.warn("no assignment", hierarchyId, assignmentId);
            return (<Assignment[]>(<any>assignments_141094_16961).subpart[0].assignments); //assignment2
        }
        return assignments;
    }
}

export enum NodeType {
    Root,
    Course,
    Chapter,
    Part,
    Subpart,
    Section
  }

  export type XData = { title: string, type: NodeType, id?: number, hierarchyID?: number, content?: string };
  export type XNode = NodeT<XData>;
    
class LessonStuff {
    
    static decodeHtml(html: string) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }
    
    static parseToTree(lessonPlan: Content) {
        const root = <XNode>{
            data: { title: "Table of Content" }, children: lessonPlan.chapters.map(chapter => {
                return <XNode>{
                    data: { title: chapter.name, type: NodeType.Chapter }, children: chapter.parts.map(part => {
                        return <XNode>{
                            data: { title: part.name, type: NodeType.Part }, children: part.subParts.map(subpart => {
                                return <XNode>{
                                    data: { title: subpart.name, type: NodeType.Subpart, hierarchyID: subpart.hierarchyID }, children: subpart.sections.map(section => {
                                        return <XNode>{ data: { title: LessonStuff.decodeHtml(section.name), type: NodeType.Section, hierarchyID: section.pivot.hierarchy_id, content: section.lesson.body }, children: [] };
                                    })
                                };
                            })
                        };
                    })
                };
            })
        };
        setParents(root);
        return root;
    }
}
