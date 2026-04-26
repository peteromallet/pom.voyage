insert into public.recommendations (name, role_title, emoji, location, body_markdown, status, sort_order)
values
(
  'Media Demo',
  'Demo recommendation for inline media rendering',
  '🖼️',
  'Remote',
  'This demo recommendation exercises inline media directives for images, links, videos, and mixed carousels.

:::media{type=image src="https://placehold.co/600x400?text=Linked+Image" link="https://example.com" alt="Linked placeholder image"}
:::

This paragraph introduces a wrapped image. The image should sit to the right on wider screens while the text flows around it, giving longer recommendations a way to include visual context without interrupting the reading rhythm.

:::media{type=image width=half wrap=right src="https://placehold.co/600x400?text=Wrapped+Image" alt="Wrapped placeholder image"}
:::

The surrounding copy continues after the wrapped media so the layout can demonstrate that the body text remains readable next to a half-width floated item. On small screens, later CSS should allow this same content to stack cleanly.

:::carousel{width=full}
- type=image src="https://placehold.co/800x450?text=Carousel+Image+1" alt="First carousel placeholder image"
- type=video src="https://www.w3schools.com/html/mov_bbb.mp4" poster="https://placehold.co/800x450?text=Video+Poster"
- type=image src="https://placehold.co/800x450?text=Carousel+Image+2" alt="Second carousel placeholder image"
:::

The carousel above mixes images and video so the client-side component can exercise both render paths.',
  'probably_unavailable',
  999
);
