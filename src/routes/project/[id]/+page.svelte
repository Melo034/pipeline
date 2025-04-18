<script>
  import { applyAction, enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import GitContributors from '$lib/GitContributors.svelte';
  import GitContributorsViewAll from '$lib/GitContributorsViewAll.svelte';
  import GitUpdate from '$lib/GitUpdate.svelte';
  import ProjectAbout from '$lib/ProjectAbout.svelte';
  import ProjectNav from '$lib/ProjectNav.svelte';
  import ResourceCard from '$lib/ResourceCard.svelte';
  import ResourcesViewAll from '$lib/ResourcesViewAll.svelte';
  import UpdateDetail from '$lib/UpdateDetail.svelte';
  import Updates from '$lib/Updates.svelte';
  import DpgStatus from '$lib/dpgStatus.svelte';
  import { amountFormat } from '$lib/utils/amountFormat.js';
  import { dateFormat } from '$lib/utils/dateTimeFormat.js';
  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';
  import Issues from '$lib/Issues.svelte';
  import { Dialog, DialogHeader, DialogContent, DialogTitle } from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Separator } from '$lib/components/ui/separator';

  import { format } from 'date-fns';
  import { toast } from 'svelte-sonner';

  

  let id;
  $: id = $page.params.id;

  let user = null;
  let image;
  let banner;
  let date;

  export let data;
  const project = data.project;
  const projectUpdates = data.updates;
  const projectResource = data.resources;
  const uniqueResourceIds = new Set(projectResource.map((r) => r.id)).size;

  const githubLinkSplit = project?.github?.split('/') || [];
  const concat = githubLinkSplit[3] + '/' + githubLinkSplit[4];

  const fetchContribs = async () => {
    try {
      const res = await fetch(`https://api.github.com/repos/${concat}/contributors`);
      const data = await res.json();
      return data;
    } catch (_e) {
      return [];
    }
  };

  let showGitDetail = false;
  let showResourceDetail = false;

  function toggleGitDetail() {
    showGitDetail = !showGitDetail;
    showResourceDetail = false;
  }

  function toggleResourceDetail() {
    showResourceDetail = !showResourceDetail;
    showGitDetail = false;
  }

  const defaultImageUrl =
    'https://zyfpmpmcpzmickajgkwp.supabase.co/storage/v1/object/public/pipeline-images/defaults/userProfile.png';

  let isFollowing = false;
  let showPopup = false;
  let popupMessage = '';
  let isAddingUpdate = false;

  let showUpdatePopup = false;

  function openUpdatePopup() {
    showUpdatePopup = true;
  }

  function closeUpdatePopup() {
    showUpdatePopup = false;
  }

  let activeNavItem = 'projectDetails';
  let showUpdateDetail = false;
  let selectedUpdate = null;

  const navItems = [
    { id: 'projectDetails', label: 'About', width: '70px' },
    { id: 'dpgStatus', label: 'DPG Status', width: '90px' },
    { id: 'updates', label: 'Updates', width: '95px' },
    { id: 'contributors', label: 'Contributors', width: '150px' },
    { id: 'tasks', label: 'Tasks', width: '70px' },
  ];

  function handleNavChange(event) {
    activeNavItem = event.detail;
    showUpdateDetail = false;
  }

  function handleShowDetail(event) {
    selectedUpdate = event.detail.update;
    showUpdateDetail = true;
  }

  function handleGoBack() {
    showUpdateDetail = false;
    selectedUpdate = null;
    showGitDetail = false;
    showResourceDetail = false;
    showGitDetail = showGitDetail;
  }

  $: date = project.created_at ? format(new Date(project.created_at), 'd/M/yy') : '';

  $: banner = project.banner_image
    ? project.banner_image
    : 'https://zyfpmpmcpzmickajgkwp.supabase.co/storage/v1/object/public/pipeline-images/defaults/banner.png?t=2024-11-20T15%3A45%3A51.937Z';

  $: image = project.image
    ? project.image
    : 'https://zyfpmpmcpzmickajgkwp.supabase.co/storage/v1/object/public/pipeline-images/defaults/projectProf.png?t=2024-11-20T16%3A05%3A41.191Z';

  let contributors = [];
  let comments = [];

  onMount(async () => {
    if (data.isAuthenticated) {
      user = data.user;
    }

    contributors = await fetchContribs();
  });

  let totalCommits = 0;

  $: {
    if (Array.isArray(contributors)) {
      totalCommits = contributors.reduce((prev, curr) => prev + curr.contributions, 0) || 0;
    }
  }
</script>

<div class="mx-auto flex max-w-[1500px] flex-col items-start px-4 lg:flex-row lg:px-8">
  <div class="w-full max-md:w-[100%] lg:sticky lg:top-0 lg:w-[40%] lg:pr-4">
    <section class="relative mb-[64px] mt-6 flex w-full flex-col">
      <!-- svelte-ignore a11y-no-redundant-roles -->
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img
        loading="lazy"
        src={banner}
        class="z-0 flex h-[250px] w-full rounded-[24px] bg-stone-300 max-md:max-w-full object-cover"
        role="img"
        aria-label="Project hero image"
        alt="Project image"
      />
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img
        loading="lazy"
        class="absolute left-1/2 z-10 h-[120px] w-[120px] -translate-x-1/2 transform rounded-full outline outline-4 outline-white max-lg:left-[20px] lg:left-[50px] lg:translate-x-0"
        style="top: 97%; transform: translateY(-50%);"
        src={image}
        alt="Project overlay image"
      />
    </section>

    <section class="flex flex-col w-full mt-3">
      <div class="flex justify-between max-md:gap-2">
        <h1 class="text-3xl font-semibold text-black break-all max-lg:mt-2 max-lg:text-xl">
          {#if project.title}
            {#if project.title.length > 20}
              <span class="lg:hidden" title={project.title}>{project.title.substring(0, 15)}...</span>
              <span class="hidden lg:inline">{project.title}</span>
            {:else}
              {project.title}
            {/if}
          {:else}
            Project Title
          {/if}
        </h1>
        <div class="flex items-center gap-1 mt-2 text-base text-neutral-600">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/edd6d143a10aa89a67f0101c84563e276eb2ea6bc943000847a62b3bcaeb9863?placeholderIfAbsent=true&apiKey=567aaefef2da4f73a3149c6bc21f1ea8"
            alt="Date icon"
            class="h-[24px] w-[24px] object-contain max-md:w-[15px]"
          />
          <time datetime="2024-10" class="max-md:text-sm">Created: {date}</time>
        </div>
      </div>

      <p class="mt-3 text-xl font-light leading-8 text-black max-lg:text-base">
        {project.bio || 'Project bio'}
      </p>
    </section>

    <section class="flex flex-wrap items-center gap-3 mt-2">
      <div class="flex flex-wrap gap-2 text-lg text-lime-800">
        {#if project.tags && project.tags.length > 0}
          {#each project.tags as tag}
            <span class="rounded-md border-2 border-[#0b383c] px-2 py-0.5 text-base max-md:px-3">
              {tag.title}
            </span>
          {/each}
        {/if}
      </div>
    </section>

    {#if user}
      <div class="flex items-center gap-3 mt-6">
        <a
          href="/project/{id}/contribute"
          class="w-full rounded-full bg-[#0b383c] py-4 text-center text-base font-semibold text-[#e9f5d3] max-md:w-[50%] lg:w-[50%]"
        >
          <button>CONTRIBUTE</button>
        </a>

        {#if user.id === project.user_id}
          <a
            href="/project/{id}/edit"
            class="w-full rounded-full bg-lime-300 py-4 text-center text-base font-semibold text-[#0b383c] max-md:w-[50%] lg:w-[50%]"
          >
            <button>EDIT PROJECT</button>
          </a>
        {:else}
          <form
            class="w-[50%]"
            action="?/bookmark"
            method="POST"
            use:enhance={() => {
              return async ({ result }) => {
                if (result.type === 'success') {
                  isFollowing = !isFollowing;
                  toast.success(
                    isFollowing
                      ? 'Project followed successfully'
                      : 'Project unfollowed successfully',
                  );
                }
              };
            }}
          >
            <button
              type="submit"
              class="w-full py-4 text-base font-semibold text-center border-2 rounded-full"
              class:bg-[#e9f5d3]={isFollowing}
              class:text-black={isFollowing}
            >
              {isFollowing ? 'UNFOLLOW' : 'FOLLOW'}
            </button>
          </form>
        {/if}
      </div>
    {/if}

    <Card class="mt-8 w-full rounded-[20px] border-0 bg-lime-300 px-6 text-teal-950 max-md:mt-6 py-8">
      <CardContent class="flex items-center justify-between gap-6 p-0">
        <div class="flex w-[120px] flex-col items-center max-md:w-[80px]">
          <div class="text-5xl font-semibold max-md:text-3xl">
            {contributors.length + uniqueResourceIds || 0}
          </div>
          <div class="text-sm max-md:text-[13px]">Contributors</div>
        </div>

        <Separator orientation="vertical" class="h-[100px] w-px bg-neutral-400 max-md:hidden" />

        <div class="flex w-[120px] flex-col items-center max-md:w-[80px]">
          <div class="text-5xl font-semibold max-md:text-3xl">
            {project.dpgCount}<span class="text-3xl">/</span><span class="text-3xl text-teal-800"
              >9</span
            >
          </div>
          <div class="text-sm max-md:text-[12px]">DPG Status</div>
        </div>

        <Separator orientation="vertical" class="h-[100px] w-px bg-neutral-400 max-md:hidden" />

        <div class="flex w-[120px] flex-col items-center max-md:w-[95px] whitespace-nowrap">
          <div class="text-4xl font-semibold max-md:text-3xl">
            ${amountFormat(project.current_funding || 0)}
          </div>
          <div class="text-sm max-md:text-[12px]">
            raised of ${amountFormat(project.funding_goal || 0)}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <div class="mt-4 w-full lg:mt-0 lg:w-[60%] lg:pl-4">
    <main
      class="flex flex-col items-start rounded-[20px] bg-white px-4 py-8 max-md:mt-6 max-md:px-4"
    >
      <ProjectNav
        class="flex items-start w-full overflow-x-auto text-sm flex-nowrap whitespace-nowrap"
        {navItems}
        bind:activeItem={activeNavItem}
        on:navChange={handleNavChange}
      />

      <section class="flex flex-col items-center w-full max-w-full mt-8">
        {#if activeNavItem === 'projectDetails'}
          <ProjectAbout {project} />
        {:else if activeNavItem === 'dpgStatus'}
          <DpgStatus {user} {project} />
        {:else if activeNavItem === 'updates'}
          {#if showUpdateDetail}
            <UpdateDetail {data} {selectedUpdate} on:goBack={handleGoBack} />
          {:else}
            <div class="flex justify-end w-full">
              {#if user && user.id === project.user_id}
                <button
                  on:click={openUpdatePopup}
                  class="w-32 py-4 mb-4 text-base font-semibold text-center text-black rounded-full bg-lime-300 max-md:py-2 max-md:text-sm md:w-40"
                >
                  ADD UPDATE
                </button>
              {/if}
            </div>

            {#if projectUpdates.length > 0}
              {#each projectUpdates as update}
                {#if update.code}
                  <GitUpdate {update} />
                {:else}
                  <Updates on:showDetail={handleShowDetail} {update} {comments} />
                {/if}
              {/each}
            {:else}
              <div class="mt-6 text-center text-gray-500">No updates available.</div>
            {/if}
          {/if}
        {:else if activeNavItem === 'contributors'}
          <div class="w-auto px-4 md:w-full md:px-10">
            {#if !showGitDetail && !showResourceDetail}
              <div class="inline-flex items-center self-stretch justify-start gap-1 mb-6">
                <div
                  class="text-center font-['Roboto'] text-2xl font-normal leading-loose text-black md:text-[32px]"
                ></div>
              </div>
          
              <div class="flex flex-col w-full pb-14 max-md:pl-5">
                    <div
                  class="flex flex-wrap items-center justify-between w-full gap-10 font-bold text-center max-md:max-w-full"
                >
                  <h2 class="self-stretch my-auto text-4xl leading-tight text-black max-md:text-sm">GitHub Contributors</h2>
          
                  <Button
                    class="flex items-center justify-center gap-1 whitespace-nowrap rounded-[40px] border-2 border-solid border-lime-800 py-2 pl-3 pr-2 text-sm leading-none text-lime-800 max-md:py-1"
                    on:click={toggleGitDetail}
                  >
                    <span class="self-stretch my-auto">View All</span>
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/e13f9fadc17a702d863b8d21bc60e6c7ea08ee8a9506ba412086d7b1a1d15195?placeholderIfAbsent=true&apiKey=567aaefef2da4f73a3149c6bc21f1ea8"
                      alt=""
                      class="self-stretch object-contain w-5 my-auto aspect-square shrink-0"
                    />
                  </Button>
                </div>
          
                <div
                  class="relative z-0 grid items-start w-full grid-cols-2 gap-4 mt-5 max-md:max-w-full"
                >
                  {#if Array.isArray(contributors) && contributors.length > 0}
                    {#each contributors.slice(0, 4) as contributor}
                      <GitContributors {contributor} {totalCommits} />
                    {/each}
                  {:else}
                    <div class="col-span-2 mt-6 text-center text-gray-500">No GitHub contributors available.</div>
                  {/if}
                </div>
              </div>
          
              <div class="flex max-w-[846px] flex-col max-md:pl-5">
                <div
                  class="flex flex-wrap items-center justify-between w-full gap-10 font-bold text-center max-md:max-w-full"
                >
                  <h2 class="self-stretch my-auto text-4xl leading-tight text-black max-md:text-xl">Resources</h2>
          
                  <Button
                    class="flex items-center justify-center gap-1 whitespace-nowrap rounded-[40px] border-2 border-solid border-lime-800 py-2 pl-3 pr-2 text-sm leading-none text-lime-800 max-md:py-1"
                    on:click={toggleResourceDetail}
                  >
                    <span class="self-stretch my-auto">View All</span>
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/e13f9fadc17a702d863b8d21bc60e6c7ea08ee8a9506ba412086d7b1a1d15195?placeholderIfAbsent=true&apiKey=567aaefef2da4f73a3149c6bc21f1ea8"
                      alt=""
                      class="self-stretch object-contain w-5 my-auto aspect-square shrink-0"
                    />
                  </Button>
                </div>
                <div class="flex flex-wrap items-start w-full gap-5 mt-5 max-md:max-w-full">
                  {#if projectResource && projectResource.length > 0}
                    {#each projectResource as resource}
                      <ResourceCard {resource} />
                    {/each}
                  {:else}
                    <div class="w-full mt-6 text-center text-gray-500">No resources available.</div>
                  {/if}
                </div>
              </div>
            {/if}
          
            {#if showGitDetail}
             <GitContributorsViewAll on:goBack={handleGoBack} /> 
            
            {:else if showResourceDetail}
              <ResourcesViewAll on:goBack={handleGoBack} />
            {/if}
          </div>
        {:else if activeNavItem === 'tasks'}
          <Issues />
        {/if}
      </section>
    </main>
  </div>
</div>

<div class="relative">
  {#if showUpdatePopup}
    <Dialog open onOpenChange={closeUpdatePopup}>
      <DialogContent
        class="fixed w-full max-w-[90%] rounded-lg bg-white p-4 shadow-lg sm:p-6 sm:max-w-[85%] md:max-w-[70%] lg:max-w-[50%] xl:max-w-[30%] sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]"
      >
        <DialogHeader>
          <DialogTitle class="mb-2 text-lg font-bold sm:text-xl sm:mb-4">Add Update</DialogTitle>
        </DialogHeader>

        <form
          action="?/addUpdate"
          method="POST"
          use:enhance={() => {
            return async ({ form, result }) => {
              if (result.type === 'success') {
                closeUpdatePopup();
                form.reset();
              }
              await applyAction(result);
              await invalidateAll();
            };
          }}
        >
          <div class="space-y-2 sm:space-y-3 w-full">
            <Label class="block text-sm font-medium text-gray-700">
              Title
              <Input
                type="text"
                name="title"
                class="w-full p-2 mt-1 border rounded-lg"
                required
                disabled={isAddingUpdate}
              />
            </Label>
            <Label class="block text-sm font-medium text-gray-700">
              Body
              <Textarea
                rows="3"
                name="body"
                class="w-full p-2 mt-1 border rounded-lg resize-none"
                required
                disabled={isAddingUpdate}
              />
            </Label>
          </div>

          <Button
            type="submit"
            class="w-full py-2 mt-3 sm:mt-4 text-black rounded-lg bg-lime-300 hover:bg-lime-400"
            disabled={isAddingUpdate}
          >
            {#if isAddingUpdate}
              <span class="flex items-center justify-center gap-2"> Adding Update... </span>
            {:else}
              Add Update
            {/if}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  {/if}
</div>