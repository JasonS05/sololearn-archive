# sololearn-archive
An archive for the more notable programs that I've written on SoloLearn. I have opted to skip archiving a great many programs that I don't believe to hold any value. These typically have only a few lines of actual code or are purely novelty items (e.g. programs obfuscated with JSFuck).

Note that the year provided for each project may not be accurate. SoloLearn only provides how many years ago the project was made, and it was the end of august as of commiting these projects to GitHub. As such, each project was made in either the stated year or the year after. These dates are also the date of last modification. SoloLearn does not provide the original creation date. Some projects may have been created well before the stated date. An example of this is my "scanline triangle rasterizer 3D renderer" which is marked as [2023] since I modified it recently but was likely made sometime in 2019 or 2020.

This repository also contains a number of programs that I never made public on SoloLearn. Some of these I chose to keep private because they are extremely GPU intensive and have the capability to lock up low-end devices while the GPU executes my program instead of doing important tasks like responding to user input. These programs have been marked with [GPU warning]. Other programs I kept private because they were incomplete, a modification of someone else's code, or just not something I deemed worthy of making public on SoloLearn. I have nonetheless included some of those programs here.

Programs marked [non-functional] are attempts to improve upon or otherwise change a prior program but failed to achieve their goal.

### WebGPU

Some of my latest programs use WebGPU. As of writing this, it is still a very new API with limited support. If you are on Windows, WebGPU is available through the latest version of Chrome. It may also be available on Edge, but I don't use Windows so I can't test that. If you are on macOS, it is available through both the latest version of Chrome and the Safari Technology Preview. For Linux, there is no browser that supplies WebGPU out of the box. However, the Chrome developer version can provide WebGPU support with the proper command line options. Currently this command works for me:

```bash

google-chrome-unstable --enable-unsafe-webgpu --gr-context-type=gl --use-vulkan=true
```

In the past, I used a different command which has since stopped working for some indecipherable reason. The old command was:

```bash

google-chrome-unstable --enable-unsafe-webgpu --enable-features=Vulkan,UseSkiaRenderer
```

These commands were found in the answers to [this](https://stackoverflow.com/questions/72294876/i-enable-webgpu-in-chrome-dev-and-it-still-doesnt-work) stackoverflow question.

For Chromebooks, I am under the impression that the latest version of Chrome supports WebGPU, but I am not certain.

To my knowledge, there is no way to run WebGPU on iPads and iPhones. For Android devices it may be possible, but I do not know of any way and I do not own any such devices.

The repository where these codes are stored is [here](https://github.com/JasonS05/sololearn-archive).

The github pages site where you can load these codes in your browser is [here](https://jasons05.github.io).

