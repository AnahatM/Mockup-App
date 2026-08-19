Export writes a PNG straight to your downloads folder. Nothing is uploaded and nothing is watermarked.

## Sizes

| Group | Presets |
| --- | --- |
| General | Match viewport, square 2048, 1920×1080, 4K |
| Web | OG image, X card, Dribbble, Product Hunt, README |
| App stores | App Store 6.7" and 6.1", iPad, Play Store |

Or choose **Custom size** and set the pixels directly.

## Scale

Multiplies the chosen size. Scale 2 on a 1200×630 OG image gives 2400×1260.

> [!IMPORTANT]
> Export resolution does not depend on your browser window. The renderer is resized for the capture and restored afterwards, so a 4K export from a laptop screen is genuinely 4K rather than an upscale.

## Transparency

**Transparent** removes the backdrop and keeps the alpha channel, giving a PNG you can drop onto any background. The contact shadow survives, so the product still looks grounded.

Turning it on does not change your scene — it only affects what is captured.

## Filename

Whatever you type, with illegal characters replaced. The `.png` extension is added for you.

## What is captured

Exactly what the viewport shows, including bloom, ambient occlusion and tone mapping — but never the light markers, which are viewport-only.
