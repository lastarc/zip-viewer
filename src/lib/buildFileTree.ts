export type TreeItem = {
	name: string;
	type: 'file' | 'folder';
	children?: TreeItem[];
};

export const buildFileTree = (filePaths: string[]): TreeItem[] => {
	const fileTree: TreeItem[] = [];

	const addFile = (filePath: string) => {
		const pathParts = filePath.split('/').filter((part) => part.length > 0);
		const fileName = pathParts.pop()!;
		let currentFolder = fileTree;
		for (const pathPart of pathParts) {
			const existingFolder = currentFolder.find((item) => item.name === pathPart);
			if (existingFolder) {
				if (existingFolder.type !== 'folder') {
					existingFolder.type = 'folder';
					existingFolder.children = [];
				}
				currentFolder = existingFolder.children as TreeItem[];
			} else {
				const newFolder: TreeItem = {
					name: pathPart,
					type: 'folder',
					children: []
				};
				currentFolder.push(newFolder);
				currentFolder = newFolder.children as TreeItem[];
			}
		}
		const newFile = {
			name: fileName,
			type: 'file'
		} as TreeItem;
		currentFolder.push(newFile);
	};

	for (const filePath of filePaths) {
		addFile(filePath);
	}

	return fileTree;
};

export const fileListFromTree = (tree: TreeItem[]): string[] => {
	const fileList: string[] = [];
	const addFile = (tree: TreeItem[], path: string) => {
		for (const item of tree) {
			fileList.push(path + item.name);
			if (item.type === 'folder') {
				addFile(item.children as TreeItem[], path + item.name + '/');
			}
		}
	};
	addFile(tree, '');
	return fileList;
};
