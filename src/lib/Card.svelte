<script>
  import ProgressBar from './ProgressBar.svelte';
  import ContributeButton from './ContributeButton.svelte';
  import CategoryTag from './CategoryTag.svelte';
  import DPGRating from './DPGRating.svelte';
  import { amountFormat } from '$lib/utils/amountFormat.js';
  import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Progress } from '$lib/components/ui/progress';
  import { onMount } from 'svelte';

  let isOpen = false;

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function closeDropdown(event) {
    if (event.target.closest('.dropdown-container')) return;
    isOpen = false;
  }

  export let project;

  const getImageLink = () => {
    return project.banner_image
      ? project.banner_image
      : 'https://zyfpmpmcpzmickajgkwp.supabase.co/storage/v1/object/public/pipeline-images/defaults/banner.png?t=2024-11-20T15%3A45%3A51.937Z';
  };

  onMount(() => {
    document.addEventListener('click', closeDropdown);
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  });

  function truncateText(text, maxLength = 25) {
    if (!text) return '';
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  }

  // Generate a unique gradient for each card based on project id
  const getGradientColors = () => {
    const gradients = [
      'from-slate-700/30 via-gray-700/30 to-zinc-700/30',
      'from-gray-700/30 via-slate-700/30 to-stone-700/30',
      'from-zinc-700/30 via-gray-700/30 to-slate-700/30',
      'from-stone-700/30 via-zinc-700/30 to-gray-700/30',
      'from-neutral-700/30 via-slate-700/30 to-zinc-700/30',
      'from-slate-800/25 via-gray-800/25 to-zinc-800/25',
      'from-gray-800/25 via-neutral-800/25 to-slate-800/25',
      'from-zinc-800/25 via-stone-800/25 to-gray-800/25',
    ];
    const index = project.id ? project.id.length % gradients.length : 0;
    return gradients[index];
  };
</script>

<div class="group relative w-full">
  <!-- Dashboard-styled Card -->
  <div
    class="dashboard-card relative h-full w-full transform-gpu overflow-hidden transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-cardHover"
  >
    <!-- Content Container -->
    <div class="relative flex h-full flex-col overflow-hidden rounded-2xl">
      <!-- Image Header -->
      <div class="relative h-48 overflow-hidden rounded-t-2xl">
        <a href="/project/{project.id}" class="block h-full">
          <div class="relative h-full w-full">
            <img
              loading="lazy"
              src={getImageLink()}
              alt={project.title}
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <!-- Dark overlay for better contrast -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-dashboard-black/60 via-transparent to-transparent"
            ></div>
          </div>
        </a>

        <!-- DPG Rating Badge -->
        <div class="absolute right-4 top-4">
          <div class="dashboard-badge">
            <DPGRating rating={project.dpgStatusCount} />
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="relative z-10 flex flex-grow flex-col space-y-4 p-6">
        <!-- Title -->
        <div>
          <a href="/project/{project.id}" class="group/title">
            <h3
              class="text-heading-lg font-semibold leading-tight text-white transition-colors duration-200 group-hover/title:text-gray-300"
            >
              {truncateText(project.title, 30)}
            </h3>
          </a>
        </div>

        <!-- SDG Tags -->
        <div class="flex flex-wrap gap-2">
          {#each project?.tags || [] as tag}
            <div class="transform transition-transform duration-200 hover:scale-105">
              <CategoryTag {tag} />
            </div>
          {/each}
        </div>

        <!-- Spacer -->
        <div class="flex-grow"></div>

        <!-- Funding Information -->
        <div class="space-y-3">
          <div class="text-gray-300">
            <div class="flex flex-wrap items-baseline gap-1">
              <span class="text-display-md font-bold text-white"
                >${amountFormat(project.current_funding || 0)}</span
              >
              <span class="text-body-sm text-gray-400">raised of</span>
              <span class="text-heading-md font-semibold text-gray-300"
                >${amountFormat(project.funding_goal || 0)}</span
              >
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="relative">
            <div class="h-2 overflow-hidden rounded-full bg-dashboard-gray-700">
              <div
                class="h-full rounded-full bg-gradient-to-r from-dashboard-purple-500 to-dashboard-purple-400 transition-all duration-1000 ease-out"
                style="width: {Math.min(
                  (project.current_funding / project.funding_goal) * 100,
                  100,
                )}%"
              ></div>
            </div>
            <!-- Progress percentage -->
            <div class="mt-2">
              <span class="text-label-sm font-medium text-gray-400">
                {Math.round((project.current_funding / project.funding_goal) * 100)}% funded
              </span>
            </div>
          </div>
        </div>

        <!-- Contribute Button -->
        <div class="pt-2">
          <ContributeButton {project} />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard-card {
    /* Dashboard card styling matching style guide */
    background: rgba(23, 23, 23, 0.85); /* dashboard-gray-900 with transparency */
    border: 1px solid rgba(64, 64, 64, 0.6); /* dashboard-gray-700 with transparency */
    border-radius: 16px; /* rounded-2xl */

    /* Subtle glass effect for dark theme */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    /* Dashboard shadow matching style guide */
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.25),
      0 2px 8px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 0 rgba(255, 255, 255, 0.04);
  }

  .dashboard-badge {
    /* Badge styling for dark theme */
    background: rgba(23, 23, 23, 0.9);
    border: 1px solid rgba(64, 64, 64, 0.8);
    border-radius: 12px; /* rounded-xl */
    padding: 8px 12px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  /* Hover effects matching dashboard style */
  .group:hover .dashboard-card {
    background: rgba(38, 38, 38, 0.9); /* dashboard-gray-800 with transparency */
    border-color: rgba(82, 82, 82, 0.8); /* dashboard-gray-600 */
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.35),
      0 4px 16px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      inset 0 -1px 0 rgba(255, 255, 255, 0.06);
  }

  /* Subtle glass texture for dark theme */
  .dashboard-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    border-radius: 16px 16px 0 0;
    z-index: 1;
  }

  .dashboard-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    bottom: 0;
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    border-radius: 16px 0 0 16px;
    z-index: 1;
  }

  /* Enhanced glass reflection on hover */
  .group:hover .dashboard-card::before {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  }

  .group:hover .dashboard-card::after {
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  }
</style>
