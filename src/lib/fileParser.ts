import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parsePDF(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => (item.str ? item.str.trim() : ''))
                .filter(Boolean)
                .join(' ');
            fullText += pageText + '\n';
        }

        if (!fullText.trim()) {
            throw new Error('PDF contains no readable text');
        }

        return fullText.trim();
    } catch (error) {
        throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function parseTextFile(file: File): Promise<string> {
    return await file.text();
}

export async function parseFile(file: File): Promise<{ content: string; type: string }> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (extension === 'pdf') {
        const content = await parsePDF(file);
        return { content, type: 'pdf' };
    } else if (['txt', 'md', 'doc', 'docx'].includes(extension)) {
        try {
            const content = await parseTextFile(file);
            if (!content || content.trim().length === 0) {
                throw new Error('File content is empty');
            }
            return { content, type: extension };
        } catch (error) {
            throw new Error(`Failed to parse ${extension} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    } else {
        throw new Error(`Unsupported file type: .${extension}. Supported types: PDF, TXT, MD, DOC, DOCX`);
    }
}
