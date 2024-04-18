<script lang="ts">
	import { Button, ButtonGroup, Input, InputAddon, Label } from 'flowbite-svelte';
	import { FileArchive, X } from 'lucide-svelte';
	import { unzipSync } from 'fflate';
	import { writable } from 'svelte/store';
	import Tree from '$lib/Tree.svelte';
	import { buildFileTree, type TreeItem } from '$lib/buildFileTree';
	import { files } from '$lib/stores/files';
	import { openedFile } from '$lib/stores/openedFile';
	import type { Unzipped } from 'fflate';
	import Prism from 'prismjs';

	const unzipped = writable<Unzipped | null>(null);
	const treeItems = writable<TreeItem[]>([]);
	let fileSelectInput: HTMLInputElement | null = null;

	const sortTreeItems = (a: TreeItem, b: TreeItem) => {
		if (a.type === 'folder' && b.type === 'file') {
			return -1;
		}

		if (a.type === 'file' && b.type === 'folder') {
			return 1;
		}

		return a.name.localeCompare(b.name);
	};

	const createTreeFromZipFile = async (file: File) => {
		const result = unzipSync(new Uint8Array(await file.arrayBuffer()));
		unzipped.set(result);
		console.log(result);
		let tree = buildFileTree(Object.keys(result));
		const sortTree = (tree: TreeItem[]) => {
			tree.sort(sortTreeItems);
			tree.forEach((item) => {
				if (item.type === 'folder') {
					sortTree(item.children || []);
				}
			});
		};
		sortTree(tree);

		treeItems.set(tree);
	};

	const uint8ArrayToString = (array: Uint8Array) => {
		return String.fromCharCode.apply(null, array);
	};

	$: {
		if ($files?.item(0)) {
			createTreeFromZipFile($files.item(0)!);
		}
	}
</script>

<svelte:head>
	<!--	<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/themes/prism.min.css" rel="stylesheet" />-->
	<link
		href="https://esm.sh/gh/GalenWong/nord-prism-js@9f085d2a64/prism-nord.css"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class={`w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 max-w-screen min-h-[60vh] max-h-[90vh] flex flex-col border rounded-xl overflow-y-scroll py-3 ${
		$openedFile ? 'md:w-5/6 lg:w-7/8 xl:w-3/4' : ''
	}`}
>
	{#if !$files || $files?.length === 0 || $treeItems.length === 0}
		<div class="mx-4">
			<Label for="fileupload" class="mb-2">
				<span class="sr-only">Select a zip file</span>
			</Label>
			<input
				type="file"
				accept=".zip,.epub"
				bind:files={$files}
				class="hidden"
				bind:this={fileSelectInput}
			/>
			<ButtonGroup class="w-full border shadow">
				<InputAddon>
					<FileArchive class="h-6 w-6" />
				</InputAddon>
				<Input
					id="fileupload"
					type="text"
					placeholder="Select a zip file"
					readonly
					value={$files?.item(0)?.name}
				/>
				<Button
					type="button"
					color="primary"
					on:click={() => {
						fileSelectInput?.click();
					}}
				>
					Select
				</Button>
			</ButtonGroup>
		</div>
	{:else}
		<div class="flex flex-wrap gap-6">
			<div class="w-full md:w-1/2">
				<div class="flex flex-col gap-1 px-4">
					<div class="flex items-center gap-3 mb-2">
						<button
							type="button"
							class="shadow rounded"
							on:click={() => {
								files.set(undefined);
								treeItems.set([]);
							}}
						>
							<X class="h-6 w-6 pt-1" />
						</button>
						<h3 class="text-lg font-bold">
							<span class="sr-only"> Contents of </span>
							{$files.item(0)?.name}
							({$openedFile || 'No file selected'})
						</h3>
					</div>
					<hr />
				</div>
				<Tree treeItems={$treeItems} />
			</div>
			{#if $openedFile}
				<div class="w-full md:w-1/2 flex flex-col flex-grow gap-1">
					<div class="flex flex-col gap-1 px-4">
						<div class="flex items-center gap-3 mb-2">
							<h3 class="text-sm font-bold">
								{$openedFile || 'No file selected'}
							</h3>
						</div>
						<hr />
					</div>
					<div class="flex-grow overflow-x-scroll max-w-[90vh]">
						{#if $openedFile && $unzipped}
							<pre class="p-4">{@html Prism.highlight(
									uint8ArrayToString($unzipped[$openedFile]),
									Prism.languages.javascript,
									'javascript'
								)}</pre>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
