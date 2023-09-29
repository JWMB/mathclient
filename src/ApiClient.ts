import type { Assignment } from "./lib/AssignmentTypes";
import type { LessonRoot } from "./lib/LessonTypes";

export class ApiClient {
    // https://api.matematik.nokportalen.se/api/v2/content/3126?courseId=3126
 
    constructor(private baseUrl: string, private auth: string) {
    }

    public async getCourse(id: number) {
        const json = await this.fetchJson(`content/${id}?courseId=${id}`);
        if (json == null) {
            return null;
        }
        return <LessonRoot>json;
    }

    public async getAssignments(courseId: number, hierarchyId?: number, assignmentId?: number) { //: Promise<Assignment[] | null>
        // https://api.matematik.nokportalen.se/api/v2/assignment/subpart?hierarchyId=3010&assignmentId=24436&courseId=2982
        let pathAndQuery = `assignment/subpart?courseId=${courseId}`;
        if (assignmentId) { pathAndQuery += `&assignmentId=${assignmentId}`; }
        if (hierarchyId) { pathAndQuery += `&hierarchyId=${hierarchyId}`; }
    
        const json = await this.fetchJson(pathAndQuery);
        if (json == null) return null;

        const foundAssignments = json["subpart"][0]["assignments"];
        if (!foundAssignments) {
            console.log("No assignments");
            return null;
        }
        return <Assignment[]>foundAssignments;
    }

    
    private async fetchJson(path: string, throwElseLog: boolean = false) {
        let url = `${this.baseUrl}${path}`;
        if (!this.auth) {
            console.warn("No auth");
            return null;
          }
  
        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                mode: "cors",
                headers: {
                  "Authorization": this.auth,
                  "Accept": "application/json, text/plain, */*",
                  "X-Destination": "api.matematik.nokportalen.se"
                }
              });
            if (response.ok) {
                return await response.json();
            } else {
                console.warn(`${response.status}/${response.statusText}: ${url}`);
            }
        } catch (err) {
            if (throwElseLog) throw err;
            console.warn(err, url);
        }
    }

}