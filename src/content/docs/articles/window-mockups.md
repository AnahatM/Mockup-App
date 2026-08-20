Window mockups wrap your screenshot in application chrome — a macOS window with traffic lights, or a browser with tabs and a URL bar.

They work three ways from the same drawing — the live preview, the flat export, and the texture on a device's screen — so what you see in any one of them is exactly what the others give you.

Window mockups are a 2D tool: nothing about them needs the 3D studio, WebGL, or a device at all. A live preview sits above the controls in the **Screen → Window mockup** panel, drawn by the exact same code that produces the flat export and the on-device texture — so it stays usable, and shows exactly what you'll get, even in a browser that cannot start WebGL.

## Turning it on

**Screen → Window mockup → Frame.** Choose **macOS** or **Browser**.

Once on, the preview and the device's screen both show the window instead of
the bare screenshot. A laptop displaying a browser window containing your
site is the classic use.

## What you can change

| Control | Applies to |
| --- | --- |
| Title | macOS windows |
| Title align | Left or centred |
| URL | Browser windows |
| Tabs | How many, 0–6 |
| Traffic lights | On or off |
| Unfocused | Grey lights, as an inactive window has |
| Dark window | Dark chrome and body |
| Match screenshot | Takes the chrome colour from your image |
| Chrome | Exact colour, when not matching |
| Title bar, Corner radius, Shadow, Margin | Proportions |

Title text picks its own foreground by contrast, so it stays readable whatever colour the chrome ends up.

## Exporting it flat

**Export window PNG** writes the window on its own at 2400px wide, with a transparent background unless you turn that off. The margin control is what leaves room for the shadow.

This is the fastest way to make a README image or a landing-page screenshot look considered.
