Recording captures the live viewport to a WebM video file. Like everything else it happens on your machine, with no encoder to download.

## Making something move

Recording a still scene gives a still video. Set a motion clip first, in the **Animate** tab:

| Clip | Loops cleanly | What it does |
| --- | --- | --- |
| Turntable | Yes | The product rotates on the spot |
| Camera orbit | Yes | The camera circles the product |
| Float | Yes | Gentle vertical drift |
| Breathe | Yes | Slow scale pulse |
| Sway | Yes | Rocks side to side |
| Tilt in | No | Swings into frame and settles |
| Pop in | No | Scales up with an overshoot |
| Parallax reveal | No | Rises and turns into place |

**Duration** is one cycle. **Amount** scales the movement, and negative values reverse it. **Easing** shapes the timing.

## Recording

In **Export → Video**: set a duration, frame rate and bitrate, then press **Record WebM**.

> [!TIP]
> Match the recording duration to the motion duration and use a looping clip. You then get a video that loops seamlessly — which is what you want for a README or a landing page.

Recording is real-time: the app captures what is actually being rendered, so a very heavy scene records at whatever rate your machine manages. If a recording comes out short or empty, lower the resolution or simplify the scene.

## Format

WebM, using VP9 where the browser supports it and VP8 otherwise. Both play in browsers and import into every common video editor.
