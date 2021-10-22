export class ConfluenceAttachmentFactory {
    public baseConfluenceUrl: string;

    constructor() {
        // @ts-ignore
        this.baseConfluenceUrl = AJS.Meta.get('base-url');
    }

    public createFromCurrentPage(attachmentName: string) {
        // @ts-ignore
        const currentPageTitle = AJS.Meta.get('latest-published-page-title');
        // @ts-ignore
        const currentSpaceKey = AJS.Meta.get('space-key');

        return new ConfluenceAttachment(currentSpaceKey, currentPageTitle, attachmentName);
    }

    public async findInCurrentSpace(attachmentName: string) {
        // @ts-ignore
        const currentSpaceKey = AJS.Meta.get('space-key');

        const url = `${this.baseConfluenceUrl}/rest/api/content/search?cql=space="${currentSpaceKey}" and type="attachment" and title="${attachmentName}"&expand=version,container`;

        const searchResults = await this.confluenceApiCall(url);
        if (!searchResults || searchResults.length == 0)
            return null;

        let results: ConfluenceAttachment[] = [];
        for (let i = 0; i < searchResults.length; i++) {
            const hit = searchResults[i];
            const pageHitTitle = hit.container.title
            results = results.concat(
                new ConfluenceAttachment(currentSpaceKey, pageHitTitle, attachmentName)
            );
        }
        return results;

    }

    public async confluenceApiCall(url: string) {
        const encodedUrl = encodeURI(url);

        const response = await fetch(encodedUrl);

        if (!response.ok) {
            return null;
        }

        const jsonData = await response.json();
        if (!jsonData || !jsonData.results) {
            return null;
        }

        return jsonData.results;
    }
}

export class ConfluenceAttachment {
    public spaceKey: string;
    public pageTitle: string;
    public attachmentTitle: string;
    public baseConfluenceUrl: string;

    constructor(
        spaceKey: string,
        pageTitle: string,
        attachmentTitle: string,
    ) {

        this.attachmentTitle = attachmentTitle;

        // @ts-ignore
        this.pageTitle = pageTitle || AJS.Meta.get('latest-published-page-title')

        // @ts-ignore
        this.spaceKey = spaceKey || AJS.Meta.get('space-key')

        // @ts-ignore
        this.baseConfluenceUrl = AJS.Meta.get('base-url');
    }


    public async create(content: any) {
        const pId = await this.pageId();
        const url = `${this.baseConfluenceUrl}/rest/api/content/${pId}/child/attachment`;

        const blob = new Blob([JSON.stringify(content)], {
            type: 'application/json',
        });
        const formData = new FormData();
        formData.append('file', blob, this.attachmentTitle);
        formData.append('minorEdit', 'true');

        const response = await fetch(url, {
            body: formData,
            headers: {
                'X-Atlassian-Token': 'nocheck',
            },
            method: 'post',
        });
        if (!response.ok) {
            return;
        }

        return response.json();
    }

    public async read() {
        const attachmentInfo = await this.attachmentInfo();
        const url = `${this.baseConfluenceUrl}${attachmentInfo._links.download}`;

        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        return response.json();
    }

    public async update(content: any) {
        const pId = await this.pageId();
        const aId = await this.attachmentId();

        const url = `${this.baseConfluenceUrl}/rest/api/content/${pId}/child/attachment/${aId}/data`;

        const formData = new FormData();
        formData.append('file', JSON.stringify(content));

        const response = await fetch(url, {
            body: formData,
            headers: {
                'X-Atlassian-Token': 'nocheck',
            },
            method: 'post',
        });
        if (!response.ok) {
            return null;
        }

        return response.json();
        // console.log("Json update complete, response is", json);
    }

    public async upsert(content: any) {
        if (await this.attachmentExists()) {
            return this.update(content);
        }

        return this.create(content);
    }

    private async pageId() {
        return (await this.pageInfo()).id;
    }

    private async pageInfo() {
        const url = this.pageInfoUrl();
        const result = await this.confluenceApiCall(url);
        return result[0];
    }

    private pageInfoUrl() {
        return `${this.baseConfluenceUrl}/rest/api/content?spaceKey=${this.spaceKey}&title=${this.pageTitle}&expand=version,container`;
    }


    public async confluenceApiCall(url: string) {
        const encodedUrl = encodeURI(url);

        const response = await fetch(encodedUrl);

        if (!response.ok) {
            return null;
        }

        const jsonData = await response.json();
        if (!jsonData || !jsonData.results) {
            return null;
        }

        return jsonData.results;
    }

    async attachmentExists() {
        const result = await this.attachmentInfo();
        return !!(result && result.id);

    }

    private async attachmentId() {
        const info = await this.attachmentInfo();
        return info.id;
    }

    private async attachmentInfo() {
        const allAttachmentsInfo = await this.allAttachmentsInfo();
        if (!allAttachmentsInfo) {
            return null;
        }
        return allAttachmentsInfo.find(
            (element: any) => element.title === this.attachmentTitle
        );
    }

    private async allAttachmentsInfo() {
        const url = await this.allAttachmentsUrl();
        return this.confluenceApiCall(url);
    }

    private async allAttachmentsUrl() {
        const id = await this.pageId();
        return `${this.baseConfluenceUrl}/rest/api/content/${id}/child/attachment?spaceKey=${this.spaceKey}&expand=version,container`;
    }


}



