update public.recommendations
set body_markdown = 'This demo recommendation exercises inline media directives for images, links, videos, and mixed carousels — now with title chips, custom call-to-action buttons, and autoplaying muted videos with an unmute toggle.

:::media{type=image src="https://placehold.co/600x400?text=Linked+Image" link="https://example.com" alt="Linked placeholder image" title="Tagged photo" title_link="https://example.com/tag" button="Visit site"}
:::

This paragraph introduces a wrapped image. The image should sit to the right on wider screens while the text flows around it, giving longer recommendations a way to include visual context without interrupting the reading rhythm.

:::media{type=image width=half wrap=right src="https://placehold.co/600x400?text=Wrapped+Image" alt="Wrapped placeholder image" title="On the right" button="More" button_link="https://example.com/more"}
:::

The surrounding copy continues after the wrapped media so the layout can demonstrate that the body text remains readable next to a half-width floated item. On small screens, later CSS should allow this same content to stack cleanly.

:::media{type=video src="https://www.w3schools.com/html/mov_bbb.mp4" poster="https://placehold.co/800x450?text=Standalone+Video" title="Big Buck Bunny" button="Watch full" button_link="https://peach.blender.org/"}
:::

A standalone video sits above on its own line. It should auto-play muted as you scroll past, and you can hit the unmute pill if you want sound.

:::carousel{width=full}
- type=image src="https://placehold.co/800x450?text=Carousel+Image+1" alt="First carousel placeholder image" title="Slide 1"
- type=video src="https://www.w3schools.com/html/mov_bbb.mp4" poster="https://placehold.co/800x450?text=Video+Poster" title="Slide 2 (video)" button="Open" button_link="https://peach.blender.org/"
- type=image src="https://placehold.co/800x450?text=Carousel+Image+3" alt="Third carousel placeholder image" title="Slide 3" title_link="https://example.com/slide-3"
:::

The carousel above mixes images and video so the client-side component can exercise both render paths. The video should autoplay muted when its slide is active.'
where name = 'Media Demo';
