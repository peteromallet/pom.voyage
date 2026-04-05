import { asset } from '../lib/assets';

export type HomeFilter = 'all' | 'initiatives' | 'art' | 'tools' | 'posts' | 'lore';

export interface SquareImageData {
  alt: string;
  label: string;
  imageSrc: string;
  videoSrc: string;
  startTime: number;
}

export interface SocialLinkData {
  href: string;
  label: string;
  icon: 'x' | 'github' | 'youtube' | 'mail';
}

type CardBase = {
  id: string;
  title: string;
  position: number;
  category?: string;
  cardClassName: string;
};

export interface StoryCardData extends CardBase {
  kind: 'story';
  imageSrc: string;
  imageAlt: string;
  paragraphs: string[];
  linkLabel?: string;
  linkHref?: string;
  linkLinks?: Array<{ label: string; href: string }>;
}

export interface ProjectCardData extends CardBase {
  kind: 'project';
  imageSrc: string;
  imageAlt: string;
  hoverGifSrc?: string;
  hoverGifAlt?: string;
  body: Array<string | JSXLink>;
  linkLabel: string;
  linkHref: string;
}

export interface VideoCardData extends CardBase {
  kind: 'video';
  thumbnailSrc: string;
  thumbnailAlt: string;
  embedSrc: string;
  embedTitle: string;
  body: string[];
  links: Array<{ label: string; href: string }>;
}

export interface DataCardData extends CardBase {
  kind: 'data';
  bodyPrefix: string;
  bodySuffix: string;
}

export interface MemeCardData extends CardBase {
  kind: 'meme';
  imageSrc: string;
  imageAlt: string;
  body: string[];
  memeImages: Array<{ src: string; alt: string }>;
}

export type JSXLink = {
  type: 'link';
  label: string;
  href: string;
};

export type HomeCardData =
  | StoryCardData
  | ProjectCardData
  | VideoCardData
  | DataCardData
  | MemeCardData;

export const HOME_FILTERS: Array<{ key: HomeFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'initiatives', label: 'Initiatives' },
  { key: 'art', label: 'Art' },
  { key: 'tools', label: 'Tools' },
  { key: 'posts', label: 'Posts' },
  { key: 'lore', label: 'Lore' },
];

export const HOME_SQUARE_IMAGES: SquareImageData[] = [
  {
    alt: 'Square image 2',
    label: 'How my wife sees me',
    imageSrc: asset('how-wife-sees-me-new.jpeg'),
    videoSrc: asset('how-wife-sees-me.mp4'),
    startTime: 0.6,
  },
  {
    alt: 'Square image 1',
    label: 'How I see me',
    imageSrc: asset('how-i-see-me.jpg'),
    videoSrc: asset('how-i-see-me.mp4'),
    startTime: 0.7,
  },
  {
    alt: 'Square image 3',
    label: 'How my dog sees me',
    imageSrc: asset('how-dog-sees-me.jpg'),
    videoSrc: asset('how-dog-sees-me.mp4'),
    startTime: 0.2,
  },
];

export const HOME_SOCIAL_LINKS: SocialLinkData[] = [
  { href: 'https://x.com/peterom', label: 'X', icon: 'x' },
  { href: 'https://github.com/peteromallet', label: 'GitHub', icon: 'github' },
  { href: 'https://www.youtube.com/@misterpeterface', label: 'YouTube', icon: 'youtube' },
  { href: 'mailto:peter@omalley.io', label: 'Email', icon: 'mail' },
];

export const HOME_CARDS: HomeCardData[] = [
  {
    id: 'road-to-nowhere',
    kind: 'story',
    title: 'Road to nowhere (2018-2022)',
    position: 7,
    category: 'lore posts',
    cardClassName: 'card story-tile loading-element',
    imageSrc: asset('road-to-nowhere.png'),
    imageAlt: 'Story visual',
    paragraphs: [
      'I spent 4.5 years of my life building a startup that ultimately went nowhere. It was a bruising but educational experience. I have many thoughts on the motivations behind the startups of generically ambitious people - which is what I was - but I\'ll save those for another time.',
    ],
    linkLinks: [
      {
        label: 'Explaining a dead startup',
        href: 'https://schlupfloch.ghost.io/explaining-advisables-failure/',
      },
      {
        label: 'Grieving for a dead startup',
        href: 'https://schlupfloch.ghost.io/grieving-for-a-dead-startup/',
      },
    ],
  },
  {
    id: 'open-source-ai-art-community',
    kind: 'story',
    title: 'Open Source AI Art Community',
    position: 2,
    category: 'initiatives',
    cardClassName: 'card story-tile loading-element',
    imageSrc: asset('open-source-ai-art.png'),
    imageAlt: 'Story visual',
    paragraphs: [
      'I spent the past two years building the Banodoco discord, a community that aims to capture everything that I love about the open source AI art ecosystem.',
      'Thanks to all the people who hang out and contribute there, I believe that it\'s the best place in the world to be if you want to be on the cutting edge of the tools that are shaping the future of art.',
      'I also hang out there all day, every day. Say hello!',
    ],
    linkLabel: 'Check it out',
    linkHref: 'https://discord.gg/acg8aNBTxd',
  },
  {
    id: 'sound-of-the-tires',
    kind: 'video',
    title: 'The sound of the tires in the snow',
    position: 1,
    category: 'art',
    cardClassName: 'card life-tile video-card loading-element',
    thumbnailSrc: asset('nirvana-video-thumbnail.png'),
    thumbnailAlt: 'Video thumbnail',
    embedSrc: 'https://www.youtube.com/embed/4AgXLXE5QIo?si=7jKSVkEww1M7T7f7',
    embedTitle: 'YouTube video player',
    body: [
      'Every year since 2022, I create a video based on the poem Nirvana by Charles Bukowski using the latest open-source AI models. I spend weeks pouring everything I have into each video and mostly end up unhappy with the result - in 2023, I was so unhappy that I made it twice. The memory of each creation is seared into my brain.',
      'Over the decades, my goal is to create a bookmark of both the technology and my own artistic skills.',
    ],
    links: [
      { label: '2022', href: 'https://www.youtube.com/watch?v=X_BLuno7C84&' },
      { label: '2023 I', href: 'https://www.youtube.com/watch?v=vWWBiDjwKkg' },
      { label: '2023 II', href: 'https://www.youtube.com/watch?v=7NkNjkP63Ko' },
      { label: '2024', href: 'https://www.youtube.com/watch?v=4AgXLXE5QIo' },
    ],
  },
  {
    id: 'steerable-motion',
    kind: 'project',
    title: 'Steerable Motion',
    position: 3,
    category: 'tools',
    cardClassName: 'card project-tile loading-element',
    imageSrc: asset('steerable-motion-visual.png'),
    imageAlt: 'Steerable Motion visual',
    hoverGifSrc: asset('steerable-motion-animation.gif'),
    hoverGifAlt: 'Steerable Motion animation',
    body: [
      'Building upon the developments of the community, I created what I believe was the first streamlined method for controlling video diffusion models using key frames. My approach extensively used the work of ',
      { type: 'link', label: 'Matt3o', href: 'https://github.com/cubiq/ComfyUI_IPAdapter_plus' },
      ', ',
      { type: 'link', label: 'Kosinkadink', href: 'https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved' },
      ', and many others in the Animatediff, ComfyUI, and Stable Diffusion 1.5 ecosystems. ',
      { type: 'link', label: 'Ian Gallagher', href: 'https://github.com/IDGallagher' },
      ' also helped get it working far more VRAM-efficiently.',
      'Though people created many beautiful videos with it - it was used for stage visuals at many festivals in 2024! - it was limited by the resolution and motion of AnimateDiff. I have a plan for a next-level version that will provide far greater control over both the visuals and motion. Coming mid-2025.',
    ],
    linkLabel: 'View on GitHub',
    linkHref: 'https://github.com/peteromallet/steerable-motion',
  },
  {
    id: 'second-renaissance-post',
    kind: 'story',
    title: 'Consider attempting to accelerate the 2nd Renaissance',
    position: 4,
    category: 'posts',
    cardClassName: 'card story-tile loading-element',
    imageSrc: asset('renaissance-visual.png'),
    imageAlt: 'Renaissance visual',
    paragraphs: [
      'If humanity plays its cards right, at some point this century, a period known as the "2nd Renaissance" will begin - a time when humans are empowered with extraordinary technology and wealth, and are inspired to use it to make the world more beautiful and meaningful. If you believe in this idea and dedicate your life to it, you may be able to accelerate the advent of this era by a few days.',
    ],
    linkLabel: 'Read an article about this',
    linkHref:
      'https://schlupfloch.ghost.io/consider-pretending-that-the-2nd-renaissance-is-about-to-start-and-that-you-can-be-a-part-of-it/',
  },
  {
    id: 'tools-for-agents',
    kind: 'story',
    title: 'Tools for agents',
    position: 6,
    category: 'tools initiatives',
    cardClassName: 'card story-tile loading-element',
    imageSrc: asset('tools-for-agents.jpeg'),
    imageAlt: 'Tools for agents',
    paragraphs: [
      "I'm very interested in building tools to enhance the capabilities of agents across both engineering and creative domains.",
    ],
    linkLinks: [
      { label: 'Desloppify', href: 'https://github.com/peteromallet/desloppify' },
      { label: 'Megaplan', href: 'https://github.com/peteromallet/megaplan' },
      { label: 'VibeComfy', href: 'https://github.com/peteromallet/VibeComfy' },
      { label: 'Dataclaw', href: 'https://github.com/peteromallet/dataclaw' },
    ],
  },
  {
    id: 'irish-pub-family',
    kind: 'story',
    title: 'I come from an Irish pub family',
    position: 8,
    category: 'lore',
    cardClassName: 'card life-tile loading-element',
    imageSrc: asset('irish-pub-visual.jpeg'),
    imageAlt: 'Irish pub visual',
    paragraphs: [
      'Very stereotypically, my family runs a pub in a small town in the middle of Ireland. That feels relevant to include for some reason.',
    ],
  },
  {
    id: 'weights',
    kind: 'data',
    title: 'My weight tracking',
    position: 10,
    category: 'initiatives',
    cardClassName: 'card data-tile loading-element',
    bodyPrefix:
      'For reference, I am 190cm - meaning my BMI currently is ',
    bodySuffix:
      '. I\'m publishing my daily weight measurements as part of my desire to maintain a more stable weight. This approach is inspired by my friend Matteo who published this great blog about how one of the greatest benefits of doing things in the open is that it gives you a greater sense of accountability to the public.',
  },
  {
    id: 'assorted-media-snippets',
    kind: 'meme',
    title: 'Assorted media snippets',
    position: 11,
    cardClassName: 'card life-tile meme-card loading-element',
    imageSrc: asset('meme-placeholder.png'),
    imageAlt: 'Meme placeholder',
    body: [],
    memeImages: [
      { src: asset('meme-princess-mononoke.png'), alt: 'Princess Mononoke meme' },
      { src: asset('meme-kanye.jpg'), alt: 'Kanye' },
      { src: asset('meme-discord-power.jpeg'), alt: 'Discord Power meme' },
      { src: asset('meme-rats.jpg'), alt: 'Rats' },
    ],
  },
];
