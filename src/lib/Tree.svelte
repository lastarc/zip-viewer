<script lang="ts">
	import { Folder, FolderOpen, File as FileIcon } from 'lucide-svelte';
	import { writable } from 'svelte/store';
	import type { TreeItem } from '$lib/buildFileTree';

	const icons = {
		folder: Folder,
		folderOpen: FolderOpen,
		file: FileIcon
	};

	const isExpandedMap = writable<Record<string, boolean>>({});

	export let treeItems: TreeItem[] = [];
	export let level = 1;
</script>

<ul>
	{#each treeItems as { name, type, children }, i}
		{@const itemId = `${level}-${i}`}
		{@const isExpanded = $isExpandedMap[itemId] ?? false}
		<li class="pl-4">
			<button
				class="flex items-center gap-1 rounded-md p-1 focus:bg-magnum-200"
				aria-expanded={isExpanded}
				on:click={() => {
					isExpandedMap.update((map) => {
						map[itemId] = !isExpanded;
						return map;
					});
				}}
			>
				{#if type === 'folder' && isExpanded}
					<svelte:component this={icons['folderOpen']} class="h-4 w-4" />
				{:else}
					<svelte:component this={icons[type]} class="h-4 w-4" />
				{/if}

				<span class="select-none">{name}</span>
			</button>

			{#if type === 'folder' && isExpanded}
				<ul>
					<svelte:self treeItems={children} level={level + 1} />
				</ul>
			{/if}
		</li>
	{/each}
</ul>
