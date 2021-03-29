# BABYLON.js Typescript Starter

This repository contains a sample BABYLON.js application.

## Setup

Run the following commands from within the repository's root folder to setup the
application:

1. `npm install`

## Running

Run the following commands from within the repository's root folder to run the 
project using `webpack-dev-server`:

1. `npm start`

Then open http://localhost:9000 in your browser

## Build

Run the following commands from within the repository's root folder to build the
project using `webpack`:

1. `npm run build`

## Automatic Deployment

Every push on master triggers a build and deploy workflow. The build output is
published to itch.io.

This workflow should be easily changeable to run on different triggers, e.g.
creating a release or pushing a tag.

For this deployment to work, you have to create your project on itch.io 
beforehand.

When you use this template, create a secret `ITCH_API_KEY` in your repository's
secret settings. You also have to adjust your username and project name in the
[workflow file](.github/workflows/build_and_publish.yml).

After the build was published, you have to configure it on itch.io to run in the
browser.

A demonstration of the deployment for this repository can be found at
https://oktinaut.itch.io/babylon-example.

## Structure

- `src/` *source code folder*

    - `index.ts` *application entry point*

    - `glsl.d.ts` *typescript definition file to resolve .glsl files*

    - `Materials/` *folder for custom materials/shaders*

        - `SampleMaterial.ts` *sample custom material*

        - `Shaders/` *folder containing GLSL shader code*

            - `Sample/` *folder containing sample shader* 

                - `sample.fragment.glsl` *sample fragment shader*

                - `sample.vertex.glsl` *sample vertex shader*

- `public` *folder containing static assets*

    - `index.html` *HTML entry point*

- `dist` *folder containing output of build process*
